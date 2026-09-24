import { IReviewRepository } from '../../../review/domain/IRepositories/IReviewRepository';
import { IReportRepository } from '../../domain/IRepositories/IReportRepository';
import { IReportActionStrategy } from './IReportActionStrategy';

/** Handles review report action strategy functionality. */
export class ReviewReportActionStrategy implements IReportActionStrategy {
  readonly targetType = 'review';

  constructor(
    private reviewRepository: IReviewRepository,
    private reportRepository: IReportRepository,
  ) {}

  /**
   * Execute action for the ReviewReportActionStrategy entity.
   *
   * @param targetId - The unique identifier for the target.
   */
  async executeAction(targetId: string): Promise<void> {
    await this.reviewRepository.hideReview(targetId);
    // Soft-deleting/resolving pending reports for this review
    await this.reportRepository.deleteManyByTarget('review', targetId);
  }
}
