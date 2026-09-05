export const MENTORSHIP_EVENTS = {
  BOOKING_CREATED: 'mentorship:booking_created',
  BOOKING_CREATED_PENDING: 'mentorship:booking_created_pending',
  BOOKING_CONFIRMED: 'mentorship:booking_confirmed',
  BOOKING_CANCELLED: 'mentorship:booking_cancelled',
  BOOKING_FAILED: 'mentorship:booking_failed',
  SESSION_REMINDER: 'mentorship:session_reminder',
} as const;

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
  cancelledBy: 'student' | 'instructor' | 'system';
  studentId: string; // Needed for notification
  instructorId: string; // Needed for notification
  previousStatus?: string;
}

export interface MentorshipBookingCreatedPendingEvent {
  bookingId: string;
  /** Delay (ms) after which the booking expires if not confirmed. */
  delayMs: number;
}
