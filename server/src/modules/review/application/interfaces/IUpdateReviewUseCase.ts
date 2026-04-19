import { Review } from '../../domain/entities/Review';

export interface IUpdateReviewUseCase {
  execute(
    studentId: string,
    reviewId: string,
    rating?: number,
    comment?: string,
  ): Promise<Review>;
}
