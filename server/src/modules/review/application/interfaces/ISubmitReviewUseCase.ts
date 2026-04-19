import { Review } from '../../domain/entities/Review';

export interface ISubmitReviewUseCase {
  execute(
    studentId: string,
    targetType: 'course' | 'session',
    targetId: string,
    rating: number,
    comment: string,
  ): Promise<Review>;
}
