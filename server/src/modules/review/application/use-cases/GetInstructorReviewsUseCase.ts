import {
  IReviewRepository,
  InstructorReviewFilters,
} from '../../domain/IRepositories/IReviewRepository';
import { IGetInstructorReviewsUseCase } from '../interfaces/IGetInstructorReviewsUseCase';
import { Review } from '../../domain/entities/Review';

export class GetInstructorReviewsUseCase
  implements IGetInstructorReviewsUseCase
{
  constructor(private reviewRepository: IReviewRepository) {}

  async execute(
    instructorId: string,
    filters: InstructorReviewFilters,
    page: number,
    limit: number,
  ): Promise<{ reviews: Review[]; total: number }> {
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

    return { reviews, total };
  }
}
