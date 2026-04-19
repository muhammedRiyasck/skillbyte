export interface IDeleteReviewUseCase {
  execute(studentId: string, reviewId: string): Promise<void>;
}
