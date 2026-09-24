import { CourseResponseDto } from '../dtos/CourseResponseDto';
import { CreateBaseValidationType } from '../dtos/CourseDetailsDtos';

/**
 * Interface for the use case that handles the initial creation of a course draft.
 */
export interface ICreateBaseUseCase {
  execute(
    dto: CreateBaseValidationType,
    instructorId: string,
  ): Promise<CourseResponseDto>;
}
