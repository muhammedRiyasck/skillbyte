import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IUpdateReviewUseCase } from '../interfaces/IUpdateReviewUseCase';
import { Review } from '../../domain/entities/Review';
import { ReviewMapper } from '../mappers/ReviewMapper';
import { ReviewResponseDto } from '../dtos/ReviewResponseDto';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ICourseRepository } from '../../../course/domain/IRepositories/ICourseRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';

/** Executes the business logic for update review. */
export class UpdateReviewUseCase implements IUpdateReviewUseCase {
  constructor(
    private reviewRepository: IReviewRepository,
    private courseRepository: ICourseRepository,
    private instructorRepository: IInstructorRepository,
  ) {}

  /**
   * Execute for the UpdateReview entity.
   *
   * @param studentId - The unique identifier for the student.
   * @param reviewId - The unique identifier for the review.
   * @param rating - The rating information.
   * @param comment - The comment information.
   * @returns The standardized HTTP response.
   */
  async execute(
    studentId: string,
    reviewId: string,
    rating?: number,
    comment?: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new HttpError('Review not found.', HttpStatusCode.NOT_FOUND);
    }
    if (review.studentId !== studentId) {
      throw new HttpError(
        'Not authorized to update this review.',
        HttpStatusCode.FORBIDDEN,
      );
    }

    const updateData: Partial<Review> = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    await this.reviewRepository.updateReview(reviewId, updateData);

    const updatedReview = await this.reviewRepository.findById(reviewId);

    if (updatedReview && updatedReview.targetType === 'course') {
      const stats = await this.reviewRepository.getAverageRating(
        'course',
        updatedReview.targetId,
      );
      await this.courseRepository.updateBaseInfo(updatedReview.targetId, {
        averageRating: stats.average,
        totalReviews: stats.count,
      });
    }

    if (updatedReview && updatedReview.instructorId) {
      const insStats = await this.reviewRepository.getInstructorAverageRating(
        updatedReview.instructorId,
      );
      await this.instructorRepository.updateById(updatedReview.instructorId, {
        averageRating: insStats.average,
        totalReviews: insStats.count,
      });
    }

    return ReviewMapper.toDto(updatedReview!);
  }
}
