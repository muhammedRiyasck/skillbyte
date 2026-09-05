import { IReviewRepository } from '../../../review/domain/IRepositories/IReviewRepository';
import { ITargetDetailStrategy, TargetDetails } from './ITargetDetailStrategy';

export class ReviewTargetDetailStrategy implements ITargetDetailStrategy {
  readonly targetType = 'review';

  constructor(private reviewRepository: IReviewRepository) {}

  async fetchDetails(targetId: string): Promise<TargetDetails | null> {
    const review = await this.reviewRepository.findById(targetId);
    if (!review) return null;
    return {
      comment: review.comment,
      rating: review.rating,
    };
  }
}
