export interface IToggleHelpfulReviewUseCase {
  execute(reviewId: string, studentId: string): Promise<boolean>;
}
