import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import {
  MentorshipBooking,
  BookingStatus,
} from '../entities/MentorshipBooking';

export interface IMentorshipBookingRepository
  extends IBaseRepository<MentorshipBooking> {
  findByStudentId(
    studentId: string,
    page?: number,
    limit?: number,
    status?: BookingStatus,
    fromDate?: Date,
    toDate?: Date,
  ): Promise<MentorshipBooking[]>;

  findByInstructorId(
    instructorId: string,
    page?: number,
    limit?: number,
    status?: BookingStatus,
  ): Promise<MentorshipBooking[]>;

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
    cancelledBy: 'student' | 'instructor' | 'system',
  ): Promise<void>;

  findUpcomingByStudentId(studentId: string): Promise<MentorshipBooking[]>;

  findUpcomingByInstructorId(
    instructorId: string,
  ): Promise<MentorshipBooking[]>;

  countPendingByStudentId(studentId: string): Promise<number>;

  findPendingByStudentId(studentId: string): Promise<MentorshipBooking | null>;

  findStalePendingBookings(now: Date): Promise<MentorshipBooking[]>;

  findConfirmedPastSessions(timeThreshold: Date): Promise<MentorshipBooking[]>;
}
