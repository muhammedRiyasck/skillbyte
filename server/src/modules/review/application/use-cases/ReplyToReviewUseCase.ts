import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IReplyToReviewUseCase } from '../interfaces/IReplyToReviewUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { Review } from '../../domain/entities/Review';

/** Executes the business logic for reply to review. */
export class ReplyToReviewUseCase implements IReplyToReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Execute for the ReplyToReview entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   * @param reviewId - The unique identifier for the review.
   * @param reply - The reply information.
   */
  async execute(
    instructorId: string,
    reviewId: string,
    reply: string,
  ): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);

    if (!review) {
      throw new HttpError('Review not found', HttpStatusCode.NOT_FOUND);
    }

    if (review.instructorId.toString() !== instructorId) {
      throw new HttpError(
        'You can only reply to reviews for your own courses/sessions.',
        HttpStatusCode.FORBIDDEN,
      );
    }

    if (reply) {
      await this.reviewRepository.updateReview(reviewId, {
        instructorReply: reply,
        repliedAt: new Date(),
      });
    } else {
      await this.reviewRepository.updateReview(reviewId, {
        $unset: { instructorReply: 1, repliedAt: 1 },
      } as unknown as Partial<Review>);
    }
  }
}
