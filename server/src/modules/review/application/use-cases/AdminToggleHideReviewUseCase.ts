import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';

import { IAdminToggleHideReviewUseCase } from '../interfaces/IAdminToggleHideReviewUseCase';

/** Executes the business logic for admin toggle hide review. */
export class AdminToggleHideReviewUseCase
  implements IAdminToggleHideReviewUseCase
{
  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Execute for the AdminToggleHideReview entity.
   *
   * @param reviewId - The unique identifier for the review.
   * @param hide - The unique identifier for the hide.
   */
  async execute(reviewId: string, hide: boolean): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review)
      throw new HttpError('Review not found', HttpStatusCode.NOT_FOUND);
    if (hide) {
      await this.reviewRepository.hideReview(reviewId);
    } else {
      await this.reviewRepository.unhideReview(reviewId);
    }
  }
}
