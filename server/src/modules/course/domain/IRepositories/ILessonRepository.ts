import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Lesson } from '../entities/Lesson';

export interface ILessonRepository extends IBaseRepository<Lesson> {
  save(data: {
    moduleId: string;
    title: string;
    contentType: 'video' | 'pdf';
    contentUrl: string;
    order: number;
    isFreePreview?: boolean;
    isPublished?: boolean;
  }): Promise<Lesson>;

  findByModuleId(moduleId: string[]): Promise<Lesson[]>;
  create(lesson: Lesson): Promise<Lesson>;
  updateLessonById(lessonId: string, updates: Partial<Lesson>): Promise<void>;
  deleteManyByModuleId(moduleId: string): Promise<void>;
  deleteManyByModuleIds(moduleIds: string[]): Promise<void>;
  countByCourseId(courseId: string): Promise<number>;
}
