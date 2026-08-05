export interface IAdminReview {
  reviewId: string;
  studentId: string;
  studentName: string;
  studentProfilePic?: string;
  targetType: 'course' | 'session';
  targetId: string;
  targetName?: string;
  instructorId: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReviewListResult {
  reviews: IAdminReview[];
  total: number;
  page: number;
  totalPages: number;
}
