export const MENTORSHIP_EVENTS = {
  BOOKING_CREATED: 'mentorship:booking_created',
  BOOKING_CONFIRMED: 'mentorship:booking_confirmed',
  BOOKING_CANCELLED: 'mentorship:booking_cancelled',
  BOOKING_FAILED: 'mentorship:booking_failed',
  SESSION_REMINDER: 'mentorship:session_reminder',
};

export interface MentorshipBookingCreatedEvent {
  bookingId: string;
  studentId: string;
  instructorId: string;
  slotId: string;
  scheduledAt: Date;
}

export interface MentorshipBookingConfirmedEvent {
  bookingId: string;
  studentId: string;
  instructorId: string;
  slotId: string;
  paymentId: string;
}

export interface MentorshipBookingCancelledEvent {
  bookingId: string;
  cancelledBy: 'student' | 'instructor';
  studentId: string; // Needed for notification
  instructorId: string; // Needed for notification
}
