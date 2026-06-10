export interface SlotResponseDto {
  slotId: string;
  instructorId: string;
  title: string;
  description: string;
  duration: 30 | 45 | 60 | 90;
  price: number;
  currency: string;
  scheduledAt: Date;
  status: string;
  jobTitle: string;
  tags: string[];
  timezone: string;
  instructorDetails?: {
    name: string;
    profilePictureUrl?: string;
    jobTitle: string;
    averageRating?: number;
    totalReviews?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
