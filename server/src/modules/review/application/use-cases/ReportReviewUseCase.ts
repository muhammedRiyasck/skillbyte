import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IReportReviewUseCase } from '../interfaces/IReportReviewUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class ReportReviewUseCase implements IReportReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new HttpError('Review not found.', HttpStatusCode.NOT_FOUND);
    }

    await this.reviewRepository.reportReview(reviewId);
  }
}
