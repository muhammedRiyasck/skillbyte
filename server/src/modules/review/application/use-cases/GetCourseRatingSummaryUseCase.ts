import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IGetCourseRatingSummaryUseCase } from '../interfaces/IGetCourseRatingSummaryUseCase';

export class GetCourseRatingSummaryUseCase
  implements IGetCourseRatingSummaryUseCase
{
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    targetType: string,
    targetId: string,
  ): Promise<{
    average: number;
    count: number;
    distribution: Record<number, number>;
  }> {
    return this.reviewRepository.getAverageRating(targetType, targetId);
  }
}
