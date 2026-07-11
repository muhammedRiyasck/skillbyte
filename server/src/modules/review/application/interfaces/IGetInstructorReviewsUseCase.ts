import { InstructorReviewFilters } from '../../domain/IRepositories/IReviewRepository';
import { ReviewResponseDto } from '../dtos/ReviewResponseDto';

export interface IGetInstructorReviewsUseCase {
  execute(
    instructorId: string,
    filters: InstructorReviewFilters,
    page: number,
    limit: number,
  ): Promise<{ reviews: ReviewResponseDto[]; total: number }>;
}
