
import { LessonInput } from "./CreateLessionDTO";

export interface CreateModuleDTO {
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonInput[];
}
