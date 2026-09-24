import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IToggleHelpfulReviewUseCase } from '../interfaces/IToggleHelpfulReviewUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Executes the business logic for toggle helpful review. */
export class ToggleHelpfulReviewUseCase implements IToggleHelpfulReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Execute for the ToggleHelpfulReview entity.
   *
   * @param reviewId - The unique identifier for the review.
   * @param studentId - The unique identifier for the student.
   * @returns The result of the operation.
   */
  async execute(reviewId: string, studentId: string): Promise<boolean> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new HttpError('Review not found.', HttpStatusCode.NOT_FOUND);
    }

    const hasUpvoted = await this.reviewRepository.hasUserUpvoted(
      reviewId,
      studentId,
    );

    if (hasUpvoted) {
      await this.reviewRepository.removeUserUpvote(reviewId, studentId);
      await this.reviewRepository.incrementHelpful(reviewId, -1);
      return false; // currently not upvoted
    } else {
      await this.reviewRepository.addUserUpvote(reviewId, studentId);
      await this.reviewRepository.incrementHelpful(reviewId, 1);
      return true; // currently upvoted
    }
  }
}
