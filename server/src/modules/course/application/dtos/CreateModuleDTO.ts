
import { LessonInput } from "./CreateLessionDTO";

 export interface CreateModuleDTO {
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonInput[];
}
