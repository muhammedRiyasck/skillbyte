import { Course } from "../../domain/entities/Course";

export interface IGetCourseUseCase{
 execute(
    courseId: string,
    role: string,
    include?: string,
  ): Promise<Course | null>
}
