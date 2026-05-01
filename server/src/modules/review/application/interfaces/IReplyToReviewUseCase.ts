export interface IReplyToReviewUseCase {
  execute(instructorId: string, reviewId: string, reply: string): Promise<void>;
}
