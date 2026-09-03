import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IReplyToReviewUseCase } from '../interfaces/IReplyToReviewUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

export class ReplyToReviewUseCase implements IReplyToReviewUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

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
        $unset: { instructorReply: 1, repliedAt: 1 }
      } as any);
    }
  }
}
