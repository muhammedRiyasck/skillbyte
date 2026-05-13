import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';

import { IAdminToggleHideReviewUseCase } from '../interfaces/IAdminToggleHideReviewUseCase';

export class AdminToggleHideReviewUseCase
  implements IAdminToggleHideReviewUseCase
{
  constructor(private reviewRepository: IReviewRepository) {}

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
