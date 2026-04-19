export interface IReviewResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}
