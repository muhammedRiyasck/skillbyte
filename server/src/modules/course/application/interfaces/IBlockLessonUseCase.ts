import { LessonResponseDto } from '../dtos/LessonDtos';

export interface IBlockLessonUseCase {
  execute(lessonId: string, isBlocked: boolean): Promise<LessonResponseDto>;
}
