import { AdminReviewFilters } from '../../domain/IRepositories/IReviewRepository';

export interface AdminReviewDto {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminReviewListResult {
  reviews: AdminReviewDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IGetAllReviewsAdminUseCase {
  execute(
    filters: AdminReviewFilters,
    page: number,
    limit: number,
  ): Promise<AdminReviewListResult>;
}
