import { IBookSlotUseCase } from '../interfaces/IBookingUseCases';
import { BookSlotDto } from '../dtos/BookingDto';
import {
  MentorshipBooking,
  BookingStatus,
} from '../../domain/entities/MentorshipBooking';
import { SlotStatus } from '../../domain/entities/MentorshipSlot';
import { BookingResponseDto } from '../dtos/BookingResponseDto';

import { BookingResponseMapper } from '../mappers/BookingResponseMapper';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { IInitiatePayment } from '../../../payment/application/interfaces/IInitiatePayment';
import { IGenerateVideoRoomUseCase } from '../interfaces/IBookingUseCases';
import { StudentModel } from '../../../student/infrastructure/models/StudentModel';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { MENTORSHIP_EVENTS } from '../../../../shared/services/event-bus/MentorshipEvents';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';
import {
  QUEUE_NAMES,
  JOB_NAMES,
} from '../../../../shared/services/job-queue/JobTypes';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class BookSlotUseCase implements IBookSlotUseCase {
  constructor(
    private slotRepo: IMentorshipSlotRepository,
    private bookingRepo: IMentorshipBookingRepository,
    private initiatePaymentUc: IInitiatePayment,
    private generateVideoRoomUc: IGenerateVideoRoomUseCase,
  ) {}

  async execute(dto: BookSlotDto): Promise<{
    booking: BookingResponseDto;
    providerResponse: PaymentInitiationResponse;
  }> {
    const { slotId, studentId, providerName } = dto;

    // 0. Check if student already booked this exact slot
    const existingBookingForSlot =
      await this.bookingRepo.findByStudentIdAndSlotId(studentId, slotId);
    let savedBooking: MentorshipBooking | null = null;
    let isFree = false;

    if (existingBookingForSlot) {
      if (
        existingBookingForSlot.status === BookingStatus.CONFIRMED ||
        existingBookingForSlot.status === BookingStatus.COMPLETED
      ) {
        throw new HttpError(
          'You have already booked this slot.',
          HttpStatusCode.CONFLICT,
        );
      }

      if (existingBookingForSlot.status === BookingStatus.PENDING) {
        // Reuse the existing pending booking
        savedBooking = existingBookingForSlot;
        isFree = existingBookingForSlot.amount === 0;
      }
    }

    // 1. Validate slot availability to get slot details needed for payment/booking
    const slot = await this.slotRepo.findById(slotId);
    if (!slot) {
      throw new HttpError('Slot not found', HttpStatusCode.NOT_FOUND);
    }
    const instructorId = slot.instructorId;

    // 2. Fetch student details (for payment metadata)
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new HttpError('Student not found', HttpStatusCode.NOT_FOUND);
    }

    if (!savedBooking) {
      // Prevent "Griefing" (Too many pending bookings).
      const pendingCount =
        await this.bookingRepo.countPendingByStudentId(studentId);
      if (pendingCount >= 1) {
        const pendingBooking =
          await this.bookingRepo.findPendingByStudentId(studentId);

        const rawSlotId = pendingBooking?.slotId as unknown;
        const pendingSlotId =
          rawSlotId && typeof rawSlotId === 'object'
            ? (rawSlotId as { slotId?: string; _id?: { toString(): string } })
                .slotId ||
              (
                rawSlotId as { slotId?: string; _id?: { toString(): string } }
              )._id?.toString()
            : (rawSlotId as string | undefined);

        if (pendingSlotId && pendingSlotId.toString() !== slotId) {
          const expiresAt = pendingBooking?.createdAt
            ? new Date(
                new Date(pendingBooking.createdAt).getTime() + 20 * 60 * 1000,
              ).toISOString()
            : null;

          throw new HttpError(
            'You already have a pending booking for a different slot. Complete the payment or cancel it before booking another slot.',
            HttpStatusCode.CONFLICT,
            {
              pendingBooking: pendingBooking
                ? {
                    bookingId: pendingBooking.bookingId,
                    slotTitle: pendingBooking.slotDetails?.title ?? null,
                    scheduledAt: pendingBooking.scheduledAt,
                    amount: pendingBooking.amount,
                    currency: pendingBooking.currency,
                    expiresAt, // auto-cancel countdown target for the UI
                  }
                : null,
            },
          );
        }
      }

      if (new Date() > new Date(slot.scheduledAt)) {
        throw new HttpError(
          'Cannot book an expired session slot',
          HttpStatusCode.BAD_REQUEST,
        );
      }

      if (slot.status !== SlotStatus.AVAILABLE) {
        throw new HttpError(
          'Slot is not available for booking',
          HttpStatusCode.BAD_REQUEST,
        );
      }

      isFree = slot.price === 0;

      // 1.1 Reserve a seat on the slot.
      if (slot.slotId) {
        await this.slotRepo.incrementBookings(slot.slotId);
      }

      // 3. Create Booking
      const initialStatus = isFree
        ? BookingStatus.CONFIRMED
        : BookingStatus.PENDING;

      const newBooking = new MentorshipBooking(
        slotId,
        studentId,
        instructorId,
        null, // paymentId (null for free sessions)
        slot.price,
        slot.currency,
        initialStatus,
        null, // videoRoomId
        null, // videoRoomUrl
        slot.scheduledAt,
      );

      savedBooking = await this.bookingRepo.save(newBooking);

      // Schedule Cleanup Job (Expire after 20 minutes if not confirmed)
      if (!isFree && savedBooking.bookingId) {
        await jobQueueService.addJob(
          QUEUE_NAMES.MENTORSHIP,
          JOB_NAMES.MENTORSHIP_CLEANUP,
          { bookingId: savedBooking.bookingId },
          { delay: 20 * 60 * 1000 }, // 20 minutes
        );
      }
    }

    try {
      let paymentResult: {
        paymentId: string;
        providerResponse: PaymentInitiationResponse;
      };

      if (!isFree) {
        if (!providerName) {
          throw new HttpError(
            'Payment provider name is required for paid sessions.',
            HttpStatusCode.BAD_REQUEST,
          );
        }

        paymentResult = await this.initiatePaymentUc.execute({
          userId: studentId,
          courseId: undefined, // Explicitly undefined for mentorship
          mentorshipBookingId: savedBooking.bookingId,
          instructorId,
          amount: slot.price,
          currency: slot.currency,
          providerName,
          productName: `Mentorship: ${slot.title}`,
          studentName: student.name,
          studentEmail: student.email,
        });

        // Update Booking with Payment ID
        if (savedBooking.bookingId) {
          await this.bookingRepo.updatePaymentId(
            savedBooking.bookingId,
            paymentResult.paymentId,
          );
          savedBooking.paymentId = paymentResult.paymentId;
        }

        // Schedule Cleanup Job (Expire after 20 minutes if not confirmed)
        if (savedBooking.bookingId) {
          await jobQueueService.addJob(
            QUEUE_NAMES.MENTORSHIP,
            JOB_NAMES.MENTORSHIP_CLEANUP,
            { bookingId: savedBooking.bookingId },
            { delay: 20 * 60 * 1000 }, // 20 minutes
          );
        }
      } else {
        // Free Booking: Mock payment result
        paymentResult = {
          paymentId: '',
          providerResponse: { id: 'free', client_secret: 'free' },
        };
        // Free booking: Generate video room immediately
        if (savedBooking.bookingId) {
          await this.generateVideoRoomUc.execute(savedBooking.bookingId);
        }
      }

      // 6. Emit Events
      const baseEventPayload = {
        bookingId: savedBooking.bookingId!,
        studentId: savedBooking.studentId,
        instructorId: savedBooking.instructorId,
        slotId: savedBooking.slotId,
        scheduledAt: savedBooking.scheduledAt,
      };

      eventBus.emit(MENTORSHIP_EVENTS.BOOKING_CREATED, baseEventPayload);

      if (isFree) {
        eventBus.emit(MENTORSHIP_EVENTS.BOOKING_CONFIRMED, {
          ...baseEventPayload,
          paymentId: 'free',
        });
      }

      // We need to fetch the updated booking to return it (because generateVideoRoomUc might have updated it)
      const finalBooking =
        (await this.bookingRepo.findById(savedBooking.bookingId!)) ||
        savedBooking;

      return {
        booking: BookingResponseMapper.toResponseDto(finalBooking),
        providerResponse: paymentResult.providerResponse,
      };
    } catch (error) {
      // Rollback the slot booking
      if (slot.slotId) {
        await this.slotRepo.decrementBookings(slot.slotId);
      }
      throw error;
    }
  }
}
