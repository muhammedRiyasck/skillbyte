import { Lesson } from "../entities/Lession";

export interface ILessonRepository {
  save(data: {
    moduleId: string;
    title: string;
    contentType: "video" | "pdf";
    contentUrl: string;
    order: number;
    isFreePreview?: boolean;
    isPublished?: boolean;
  }): Promise<Lesson>;
  
  findByModuleId(moduleId: string): Promise<Lesson[]>;
  create(lesson: Lesson): Promise<void>;
  updateById(lessonId: string, updates: Partial<Lesson>): Promise<void>;
  findById(id: string): Promise<Lesson | null>;
  deleteById(lessonId: string): Promise<void>;
  deleteManyByModuleId(moduleId: string): Promise<void>;
  deleteManyByModuleIds(moduleIds: string[]): Promise<void>;
}
