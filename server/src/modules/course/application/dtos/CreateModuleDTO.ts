
import { LessonInput } from "./createLessionDTO";

 export interface CreateModuleDTO {
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: LessonInput[];
}
