import { Lesson } from '../../domain/entities/Lesson';

type UpdatableLessonFields = Omit<
  Lesson,
  'createdAt' | 'updatedAt' | 'courseId'
>;
type IUpdateLesson = Partial<UpdatableLessonFields>;

export interface IUpdateLessonUseCase {
  execute(
    lessonId: string,
    instructorId: string,
    updates: IUpdateLesson,
  ): Promise<void>;
}
