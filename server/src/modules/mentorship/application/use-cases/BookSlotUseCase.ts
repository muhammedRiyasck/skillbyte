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
  ) {}

  async execute(dto: BookSlotDto): Promise<{
    booking: BookingResponseDto;
    providerResponse: PaymentInitiationResponse;
  }> {
    const { slotId, studentId, providerName } = dto;

    // Prevent "Griefing" (Too many pending bookings)
    const pendingCount =
      await this.bookingRepo.countPendingByStudentId(studentId);
    if (pendingCount >= 1) {
      throw new HttpError(
        'You have already a pending booking. Please complete or cancel existing one before booking more.',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // 1. Validate slot availability
    const slot = await this.slotRepo.findById(slotId);
    if (!slot) {
      throw new HttpError('Slot not found', HttpStatusCode.NOT_FOUND);
    }
    if (slot.status !== SlotStatus.AVAILABLE) {
      throw new HttpError(
        'Slot is not available for booking',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const instructorId = slot.instructorId;

    // 1.1 Lock the slot
    if (slot.slotId) {
      await this.slotRepo.updateStatus(slot.slotId, SlotStatus.BOOKED);
      await this.slotRepo.incrementBookings(slot.slotId);
    }

    // 2. Fetch student details (for payment metadata)
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new HttpError('Student not found', HttpStatusCode.NOT_FOUND);
    }

    // 3. Create Booking
    const isFree = slot.price === 0;
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

    const savedBooking = await this.bookingRepo.save(newBooking);

    let paymentResult: {
      paymentId: string;
      providerResponse: PaymentInitiationResponse;
    };

    if (!isFree) {
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

    return {
      booking: BookingResponseMapper.toResponseDto(savedBooking),
      providerResponse: paymentResult.providerResponse,
    };
  }
}
