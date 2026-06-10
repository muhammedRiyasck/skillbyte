import { MentorshipBooking } from '../../domain/entities/MentorshipBooking';
import { BookingResponseDto } from '../dtos/BookingResponseDto';

export class BookingResponseMapper {
  static toResponseDto(booking: MentorshipBooking): BookingResponseDto {
    return {
      bookingId: booking.bookingId!,
      slotId: booking.slotId,
      studentId: booking.studentId,
      instructorId: booking.instructorId,
      // Note: paymentId is intentionally excluded — sensitive payment data
      amount: booking.amount,
      currency: booking.currency,
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancelledBy: booking.cancelledBy,
      videoRoomId: booking.videoRoomId,
      videoRoomUrl: booking.videoRoomUrl,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
