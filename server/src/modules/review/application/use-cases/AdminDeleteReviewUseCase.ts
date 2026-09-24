import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';

import { IAdminDeleteReviewUseCase } from '../interfaces/IAdminDeleteReviewUseCase';

/** Executes the business logic for admin delete review. */
export class AdminDeleteReviewUseCase implements IAdminDeleteReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Execute for the AdminDeleteReview entity.
   *
   * @param reviewId - The unique identifier for the review.
   */
  async execute(reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review)
      throw new HttpError('Review not found', HttpStatusCode.NOT_FOUND);
    await this.reviewRepository.adminDeleteReview(reviewId);
  }
}
