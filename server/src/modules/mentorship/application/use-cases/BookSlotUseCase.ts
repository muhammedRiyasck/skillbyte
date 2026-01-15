import { IBookSlotUseCase } from '../interfaces/IBookingUseCases';
import { BookSlotDto } from '../dtos/BookingDto';
import { MentorshipBooking } from '../../domain/entities/MentorshipBooking';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { IMentorshipSlotRepository } from '../../domain/IRepositories/IMentorshipSlotRepository';
import { IMentorshipBookingRepository } from '../../domain/IRepositories/IMentorshipBookingRepository';
import { IInitiatePayment } from '../../../payment/application/interfaces/IInitiatePayment';
import { StudentModel } from '../../../student/infrastructure/models/StudentModel';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import { MENTORSHIP_EVENTS } from '../../../../shared/services/event-bus/MentorshipEvents';

export class BookSlotUseCase implements IBookSlotUseCase {
  constructor(
    private slotRepo: IMentorshipSlotRepository,
    private bookingRepo: IMentorshipBookingRepository,
    private initiatePaymentUc: IInitiatePayment,
  ) {}

  async execute(dto: BookSlotDto): Promise<{
    booking: MentorshipBooking;
    providerResponse: PaymentInitiationResponse;
  }> {
    const { slotId, studentId, providerName } = dto;

    // 1. Validate slot availability
    const slot = await this.slotRepo.findById(slotId);
    if (!slot) {
      throw new Error('Slot not found');
    }
    if (slot.status !== 'available') {
      throw new Error('Slot is not available for booking');
    }

    const instructorId = slot.instructorId;

    // 1.1 Lock the slot
    if (slot.slotId) {
      await this.slotRepo.updateStatus(slot.slotId, 'booked');
      await this.slotRepo.incrementBookings(slot.slotId);
    }

    // 2. Fetch student details (for payment metadata)
    const student = await StudentModel.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // 3. Create Pending Booking
    const newBooking = new MentorshipBooking(
      slotId,
      studentId,
      instructorId,
      'pending_init',
      slot.price,
      slot.currency,
      'pending',
      null, // videoRoomId
      null, // videoRoomUrl
      slot.scheduledAt,
    );

    const savedBooking = await this.bookingRepo.save(newBooking);

    const paymentResult = await this.initiatePaymentUc.execute({
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

    // 5. Update Booking with Payment ID
    if (savedBooking.bookingId) {
      await this.bookingRepo.updatePaymentId(
        savedBooking.bookingId,
        paymentResult.paymentId,
      );
      savedBooking.paymentId = paymentResult.paymentId;
    }

    // Emit Event
    const eventPayload = {
      bookingId: savedBooking.bookingId!,
      studentId: savedBooking.studentId,
      instructorId: savedBooking.instructorId,
      slotId: savedBooking.slotId,
      scheduledAt: savedBooking.scheduledAt,
    };
    eventBus.emit(MENTORSHIP_EVENTS.BOOKING_CREATED, eventPayload);

    return {
      booking: savedBooking,
      providerResponse: paymentResult.providerResponse,
    };
  }
}
