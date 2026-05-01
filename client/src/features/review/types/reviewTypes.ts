export interface IReview {
  reviewId: string;
  studentId: string;
  student?: {
    name: string;
    profileImageUrl?: string;
  };
  targetType: 'course' | 'session';
  
  targetId: string;
  instructorId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  isUpvotedByCurrentUser: boolean;
  instructorReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
  targetName?: string;
}

export interface ReviewResponse {
  reviews: IReview[];
  total: number;
}

export interface RatingSummary {
  average: number;
  count: number;
  distribution: {
    [key: number]: number; // 1 to 5 keys mapped to counts
  };
}

export interface SubmitReviewRequest {
  targetType: 'course' | 'session';
  targetId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}
