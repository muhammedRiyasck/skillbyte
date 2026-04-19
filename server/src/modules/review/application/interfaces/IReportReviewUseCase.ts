export interface IReportReviewUseCase {
  execute(reviewId: string): Promise<void>;
}
