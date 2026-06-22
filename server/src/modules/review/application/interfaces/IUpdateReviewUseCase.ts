import { ReviewResponseDto } from '../dtos/ReviewResponseDto';

export interface IUpdateReviewUseCase {
  execute(
    studentId: string,
    reviewId: string,
    rating?: number,
    comment?: string,
  ): Promise<ReviewResponseDto>;
}
