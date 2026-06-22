import { IReviewRepository } from '../../domain/IRepositories/IReviewRepository';
import { IGetReviewsUseCase } from '../interfaces/IGetReviewsUseCase';
import { ReviewResponseDto } from '../dtos/ReviewResponseDto';
import { ReviewMapper } from '../mappers/ReviewMapper';

export class GetReviewsUseCase implements IGetReviewsUseCase {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    targetType: string,
    targetId: string,
    currentUserId?: string,
    sort: 'recent' | 'helpful' = 'recent',
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reviews: ReviewResponseDto[]; total: number }> {
    const rawReviews = await this.reviewRepository.findByTarget(
      targetType,
      targetId,
      sort,
      page,
      limit,
    );

    const total = await this.reviewRepository.countByTarget(
      targetType,
      targetId,
    );

    const mappedReviews = await Promise.all(
      rawReviews.map(async (review) => {
        let isUpvotedByCurrentUser = false;
        if (currentUserId && review.reviewId) {
          isUpvotedByCurrentUser = await this.reviewRepository.hasUserUpvoted(
            review.reviewId,
            currentUserId,
          );
        }

        // Notice we are passing the populated student document (which is currently just the object id string if not populated, but our repo populates it).
        // Since our repository casts entity by calling doc.studentId.toString(), the populated doc is lost in the domain entity unless we tweak the mapper.
        // Let's pass the raw document or adapt the repository. For now we assume the entity has studentId string.
        // Mongoose populate sets doc.studentId to the document.
        // We will adapt this slightly in the controller or mapper if we need full student details.
        // For now, let's keep it simple.
        return ReviewMapper.toResponseDto(
          review,
          review.studentInfo,
          isUpvotedByCurrentUser,
        );
      }),
    );

    return {
      reviews: mappedReviews,
      total,
    };
  }
}
