export interface ReviewResponseDto {
  reviewId: string;
  studentId: string;
  student?: {
    name: string;
    profileImageUrl?: string;
  };
  targetType: string;
  targetId: string;
  instructorId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  isUpvotedByCurrentUser: boolean;
  instructorReply?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  targetName?: string;
}
