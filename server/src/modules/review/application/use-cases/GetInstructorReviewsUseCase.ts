import {
  IReviewRepository,
  InstructorReviewFilters,
} from '../../domain/IRepositories/IReviewRepository';
import { IGetInstructorReviewsUseCase } from '../interfaces/IGetInstructorReviewsUseCase';
import { ReviewResponseDto } from '../dtos/ReviewResponseDto';
import { ReviewMapper } from '../mappers/ReviewMapper';

export class GetInstructorReviewsUseCase
  implements IGetInstructorReviewsUseCase
{
  constructor(private reviewRepository: IReviewRepository) {}

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
