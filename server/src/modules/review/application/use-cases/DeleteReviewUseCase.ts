import { IDeleteReviewUseCase } from '../interfaces/IDeleteReviewUseCase';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';

/** Executes the business logic for delete review. */
export class DeleteReviewUseCase implements IDeleteReviewUseCase {
  constructor(
    private reviewRepository: IReviewRepository,
    private courseRepository: ICourseRepository,
    private instructorRepository: IInstructorRepository,
  ) {}

  /**
   * Execute for the DeleteReview entity.
   *
   * @param studentId - The unique identifier for the student.
   * @param reviewId - The unique identifier for the review.
   */
  async execute(studentId: string, reviewId: string): Promise<void> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new HttpError('Review not found.', HttpStatusCode.NOT_FOUND);
    }
    if (review.studentId !== studentId) {
      throw new HttpError(
        'Not authorized to delete this review.',
        HttpStatusCode.FORBIDDEN,
      );
    }

    const targetType = review.targetType;
    const targetId = review.targetId;

    await this.reviewRepository.deleteReview(reviewId);

    if (targetType === 'course') {
      const stats = await this.reviewRepository.getAverageRating(
        'course',
        targetId,
      );
      await this.courseRepository.updateBaseInfo(targetId, {
        averageRating: stats.average,
        totalReviews: stats.count,
      });
    }

    if (review.instructorId) {
      const insStats = await this.reviewRepository.getInstructorAverageRating(
        review.instructorId,
      );
      await this.instructorRepository.updateById(review.instructorId, {
        averageRating: insStats.average,
        totalReviews: insStats.count,
      });
    }
  }
}
