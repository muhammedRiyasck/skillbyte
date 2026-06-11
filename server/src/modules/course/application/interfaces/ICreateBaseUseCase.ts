import { CreateCourseDto } from '../dtos/CourseDto';
import { CourseResponseDto } from '../dtos/CourseResponseDto';

export interface ICreateBaseUseCase {
  execute(dto: CreateCourseDto): Promise<CourseResponseDto>;
}
