import { InstructorEnrollmentsResponseDto } from '../dtos/InstructorEnrollmentsResponseDto';
import { InstructorEnrollmentFiltersDto } from '../dtos/InstructorEnrollmentFiltersDto';

export interface IGetInstructorEnrollmentsUseCase {
  execute(
    instructorId: string,
    page: number,
    limit: number,
    filters?: InstructorEnrollmentFiltersDto,
  ): Promise<InstructorEnrollmentsResponseDto>;
}
