import { Review } from '../../domain/entities/Review';
import { InstructorReviewFilters } from '../../domain/IRepositories/IReviewRepository';

export interface IGetInstructorReviewsUseCase {
  execute(
    instructorId: string,
    filters: InstructorReviewFilters,
    page: number,
    limit: number,
  ): Promise<{ reviews: Review[]; total: number }>;
}
