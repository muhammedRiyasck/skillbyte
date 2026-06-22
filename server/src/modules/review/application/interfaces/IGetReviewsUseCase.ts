import { ReviewResponseDto } from '../dtos/ReviewResponseDto';

export interface IGetReviewsUseCase {
  execute(
    targetType: string,
    targetId: string,
    currentUserId?: string,
    sort?: 'recent' | 'helpful',
    page?: number,
    limit?: number,
  ): Promise<{ reviews: ReviewResponseDto[]; total: number }>;
}
