import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Course } from '../entities/Course';

export interface ICourseRepository extends IBaseRepository<Course> {
  findPublishedCourses(filters: {
    search?: string;
    category?: string;
  }): Promise<Course[]>;
  findAllForAdmin(filters: {
    instructorId?: string;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Course[]>;
  updateBaseInfo(
    courseId: string,
    updatedFields: Partial<Course>,
  ): Promise<void>;
  updateStatus(courseId: string, status: 'list' | 'unlist'): Promise<void>;
  getCategories(): Promise<string[]>;
  blockCourse(courseId: string, isBlocked: boolean): Promise<void>;
}
