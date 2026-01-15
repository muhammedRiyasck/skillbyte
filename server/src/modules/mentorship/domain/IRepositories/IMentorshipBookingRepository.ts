import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import {
  MentorshipBooking,
  BookingStatus,
} from '../entities/MentorshipBooking';

export interface IMentorshipBookingRepository
  extends IBaseRepository<MentorshipBooking> {
  findByStudentId(studentId: string): Promise<MentorshipBooking[]>;

  findByInstructorId(instructorId: string): Promise<MentorshipBooking[]>;

  findBySlotId(slotId: string): Promise<MentorshipBooking[]>;

  updateStatus(bookingId: string, status: BookingStatus): Promise<void>;

  setVideoRoom(
    bookingId: string,
    videoRoomId: string,
    videoRoomUrl: string,
  ): Promise<void>;

  updatePaymentId(bookingId: string, paymentId: string): Promise<void>;

  markAsCompleted(bookingId: string): Promise<void>;

  markAsCancelled(
    bookingId: string,
    cancelledBy: 'student' | 'instructor',
  ): Promise<void>;

  findUpcomingByStudentId(studentId: string): Promise<MentorshipBooking[]>;

  findUpcomingByInstructorId(
    instructorId: string,
  ): Promise<MentorshipBooking[]>;
}
