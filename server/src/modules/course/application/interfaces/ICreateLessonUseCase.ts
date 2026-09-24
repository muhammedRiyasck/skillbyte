import { CreateLessonDto, LessonResponseDto } from '../dtos/LessonDtos';

export interface ICreateLessonUseCase {
  execute(
    dto: CreateLessonDto,
    instructorId: string,
  ): Promise<LessonResponseDto>;
}
