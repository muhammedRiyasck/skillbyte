import type { LessonType } from "./ILesson";

export interface ModuleType {
  id: string;
  title: string;
  description: string;
  lessons: LessonType[];
}
