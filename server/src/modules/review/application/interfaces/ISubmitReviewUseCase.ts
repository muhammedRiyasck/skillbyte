import { ReviewResponseDto } from '../dtos/ReviewResponseDto';

export interface ISubmitReviewUseCase {
  execute(
    studentId: string,
    targetType: 'course' | 'session',
    targetId: string,
    rating: number,
    comment: string,
  ): Promise<ReviewResponseDto>;
}
