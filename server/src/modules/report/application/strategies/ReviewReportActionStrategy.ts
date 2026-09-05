import { IReviewRepository } from '../../../review/domain/IRepositories/IReviewRepository';
import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { IReportActionStrategy } from './IReportActionStrategy';

export class ReviewReportActionStrategy implements IReportActionStrategy {
  readonly targetType = 'review';

  constructor(
    private reviewRepository: IReviewRepository,
    private reportRepository: IReportRepository,
  ) {}

  async executeAction(targetId: string): Promise<void> {
    await this.reviewRepository.hideReview(targetId);
    // Soft-deleting/resolving pending reports for this review
    await this.reportRepository.deleteManyByTarget('review', targetId);
  }
}
