import { IReviewRepository } from '../../../review/domain/IRepositories/IReviewRepository';
import { ITargetDetailStrategy, TargetDetails } from './ITargetDetailStrategy';

/** Handles review target detail strategy functionality. */
export class ReviewTargetDetailStrategy implements ITargetDetailStrategy {
  readonly targetType = 'review';

  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Fetch details for the ReviewTargetDetailStrategy entity.
   *
   * @param targetId - The unique identifier for the target.
   * @returns The result of the operation.
   */
  async fetchDetails(targetId: string): Promise<TargetDetails | null> {
    const review = await this.reviewRepository.findById(targetId);
    if (!review) return null;
    return {
      comment: review.comment,
      rating: review.rating,
    };
  }
}
