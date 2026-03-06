import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export interface IUpdateCourseStatusUseCase {
  execute(
    courseId: string,
    instructorId: string,
    status: CourseStatus,
  ): Promise<void>;
}
