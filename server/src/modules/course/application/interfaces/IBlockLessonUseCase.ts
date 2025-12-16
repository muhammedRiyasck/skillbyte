import { Lesson } from '../../domain/entities/Lesson';

export interface IBlockLessonUseCase {
  execute(lessonId: string, isBlocked: boolean): Promise<Lesson>;
}
