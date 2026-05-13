export interface IAdminDeleteReviewUseCase {
  execute(reviewId: string): Promise<void>;
}
