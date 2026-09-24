import {
  IReviewRepository,
  InstructorReviewFilters,
} from '../../domain/IRepositories/IReviewRepository';
import { IGetInstructorReviewsUseCase } from '../interfaces/IGetInstructorReviewsUseCase';
import { ReviewResponseDto } from '../dtos/ReviewResponseDto';
import { ReviewMapper } from '../mappers/ReviewMapper';

/** Executes the business logic for get instructor reviews. */
export class GetInstructorReviewsUseCase
  implements IGetInstructorReviewsUseCase
{
  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Execute for the GetInstructorReviews entity.
   *
   * @param instructorId - The unique identifier for the instructor.
   * @param filters - The filters information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @returns The standardized HTTP response.
   */
  async execute(
    instructorId: string,
    filters: InstructorReviewFilters,
    page: number,
    limit: number,
  ): Promise<{ reviews: ReviewResponseDto[]; total: number }> {
    const reviews = await this.reviewRepository.findInstructorReviews(
      instructorId,
      filters,
      page,
      limit,
    );
    const total = await this.reviewRepository.countInstructorReviews(
      instructorId,
      filters,
    );

    const mappedReviews = reviews.map((r) =>
      ReviewMapper.toDto(r, r.studentInfo),
    );

    return { reviews: mappedReviews, total };
  }
}
