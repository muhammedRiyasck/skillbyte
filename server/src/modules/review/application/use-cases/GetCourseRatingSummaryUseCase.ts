import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IGetCourseRatingSummaryUseCase } from '../interfaces/IGetCourseRatingSummaryUseCase';

/** Executes the business logic for get course rating summary. */
export class GetCourseRatingSummaryUseCase
  implements IGetCourseRatingSummaryUseCase
{
  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Execute for the GetCourseRatingSummary entity.
   *
   * @param targetType - The target type information.
   * @param targetId - The unique identifier for the target.
   * @returns The result of the operation.
   */
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
