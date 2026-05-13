export interface IAdminToggleHideReviewUseCase {
  execute(reviewId: string, hide: boolean): Promise<void>;
}
