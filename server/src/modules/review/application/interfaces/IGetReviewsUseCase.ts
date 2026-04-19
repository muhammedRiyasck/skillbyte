import { IReviewResponseDto } from './IReviewResponseDto';

export interface IGetReviewsUseCase {
  execute(
    targetType: string,
    targetId: string,
    currentUserId?: string,
    sort?: 'recent' | 'helpful',
    page?: number,
    limit?: number,
  ): Promise<{ reviews: IReviewResponseDto[]; total: number }>;
}
