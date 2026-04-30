import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';

export interface IAdminDeleteReviewUseCase {
  execute(reviewId: string): Promise<void>;
}

export class AdminDeleteReviewUseCase implements IAdminDeleteReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) throw new HttpError('Review not found', HttpStatusCode.NOT_FOUND);
    await this.reviewRepository.adminDeleteReview(reviewId);
  }
}
