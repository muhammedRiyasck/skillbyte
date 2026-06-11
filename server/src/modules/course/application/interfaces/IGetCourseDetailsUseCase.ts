import { GetCourseDto } from '../dtos/CourseDto';
import { CourseResponseDto } from '../dtos/CourseResponseDto';

export interface IGetCourseUseCase {
  execute(dto: GetCourseDto): Promise<CourseResponseDto | null>;
}
