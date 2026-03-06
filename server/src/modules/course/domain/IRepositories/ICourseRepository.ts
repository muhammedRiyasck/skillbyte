import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Course } from '../entities/Course';
import { CourseStatus } from '../../../../shared/enums/CourseStatus';

export interface ICourseRepository extends IBaseRepository<Course> {
  findPublishedCourses(filters: {
    search?: string;
    category?: string;
  }): Promise<Course[]>;
  findAllForAdmin(filters: {
    instructorId?: string;
    status?: string; // This can be AdminCourseFilter, but keep it string for now if it's broad
    category?: string;
    search?: string;
  }): Promise<Course[]>;
  updateBaseInfo(
    courseId: string,
    updatedFields: Partial<Course>,
  ): Promise<void>;
  updateStatus(courseId: string, status: CourseStatus): Promise<void>;
  getCategories(): Promise<string[]>;
  blockCourse(courseId: string, isBlocked: boolean): Promise<void>;
}
