export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum CancelledBy {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  SYSTEM = 'system',
}

export class MentorshipBooking {
  constructor(
    public slotId: string,
    public studentId: string,
    public instructorId: string,
    public paymentId: string | null,
    public amount: number, // in smallest currency unit
    public currency: string,
    public status: BookingStatus = BookingStatus.PENDING,
    public videoRoomId: string | null = null,
    public videoRoomUrl: string | null = null,
    public scheduledAt: Date,
    public completedAt: Date | null = null,
    public cancelledAt: Date | null = null,
    public cancelledBy: CancelledBy | null = null,
    public bookingId?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public studentDetails?: {
      name: string;
      email: string;
      profileImageUrl?: string;
    },
    public slotDetails?: {
      duration: number;
      title: string;
    },
  ) {}
}
