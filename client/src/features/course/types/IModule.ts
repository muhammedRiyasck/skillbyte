import type { LessonType } from "./ILesson";

export interface ModuleType {
  moduleId: string;
  title: string;
  description:string;
  lessons: LessonType[];
}
