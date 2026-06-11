import { GetCoursesQueryDto } from '../dtos/CourseDto';
import { PaginatedCourseResponseDto } from '../dtos/CourseResponseDto';

export interface IGetPaginatedCoursesUseCase {
  execute(dto: GetCoursesQueryDto): Promise<PaginatedCourseResponseDto | null>;
}
