import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IReportReviewUseCase } from '../interfaces/IReportReviewUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for report review. */
export class ReportReviewUseCase implements IReportReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Execute for the ReportReview entity.
   *
   * @param reviewId - The unique identifier for the review.
   */
  async execute(reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new HttpError('Review not found.', HttpStatusCode.NOT_FOUND);
    }

    await this.reviewRepository.hideReview(reviewId);
  }
}
