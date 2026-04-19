export enum SlotStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class MentorshipSlot {
  constructor(
    public instructorId: string,
    public title: string,
    public description: string,
    public duration: 30 | 45 | 60 | 90, // in minutes
    public price: number, // in smallest currency unit (cents/paise)
    public currency: string,
    public scheduledAt: Date,
    public status: SlotStatus = SlotStatus.AVAILABLE,
    public maxBookings: number = 1, // Usually 1 for 1:1
    public currentBookings: number = 0,
    public jobTitle: string,
    public tags: string[] = [],
    public timezone: string = 'UTC',
    public slotId?: string,
    public instructorDetails?: {
      name: string;
      profilePictureUrl?: string;
      jobTitle: string;
      averageRating?: number;
      totalReviews?: number;
    },
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
