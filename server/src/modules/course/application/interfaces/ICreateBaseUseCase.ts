import { CourseResponseDto } from '../dtos/CourseResponseDto';
import { CreateBaseValidationType } from '../dtos/CourseDetailsDtos';

export interface ICreateBaseUseCase {
  execute(dto: CreateBaseValidationType, instructorId: string): Promise<CourseResponseDto>;
}
