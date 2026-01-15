export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type CancelledBy = 'student' | 'instructor' | null;

export class MentorshipBooking {
  constructor(
    public slotId: string,
    public studentId: string,
    public instructorId: string,
    public paymentId: string,
    public amount: number, // in smallest currency unit
    public currency: string,
    public status: BookingStatus = 'pending',
    public videoRoomId: string | null = null,
    public videoRoomUrl: string | null = null,
    public scheduledAt: Date,
    public completedAt: Date | null = null,
    public cancelledAt: Date | null = null,
    public cancelledBy: CancelledBy = null,
    public bookingId?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
