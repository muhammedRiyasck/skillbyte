import { Lesson } from "./Lesson";

export interface ModuleWithLessons {
  moduleId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

