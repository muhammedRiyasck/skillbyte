import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Review } from '../entities/Review';

export interface IReviewRepository extends IBaseRepository<Review> {
  findByTarget(
    targetType: string,
    targetId: string,
    sort: 'recent' | 'helpful',
    page: number,
    limit: number,
  ): Promise<Review[]>;
  findByStudentAndTarget(
    studentId: string,
    targetType: string,
    targetId: string,
  ): Promise<Review | null>;
  findStudentSessionRatings(studentId: string): Promise<Record<string, number>>;
  getAverageRating(
    targetType: string,
    targetId: string,
  ): Promise<{
    average: number;
    count: number;
    distribution: Record<number, number>;
  }>;
  getInstructorAverageRating(
    instructorId: string,
  ): Promise<{ average: number; count: number }>;
  updateReview(reviewId: string, data: Partial<Review>): Promise<void>;
  deleteReview(reviewId: string): Promise<void>;
  incrementHelpful(reviewId: string, incrementBy: number): Promise<void>;
  reportReview(reviewId: string): Promise<void>;
  countByTarget(targetType: string, targetId: string): Promise<number>;
  hasUserUpvoted(reviewId: string, userId: string): Promise<boolean>;
  addUserUpvote(reviewId: string, userId: string): Promise<void>;
  removeUserUpvote(reviewId: string, userId: string): Promise<void>;
}
