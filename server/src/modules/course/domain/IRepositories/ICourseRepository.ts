import { Course } from "../entities/Course";
import { ModuleWithLessons } from "../entities/IModuleWithLessons";

export interface ICourseRepository {
  save(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findPublishedCourses(filters: { search?: string; category?: string; }): Promise<Course[]>;
  listPaginated(filter: Record<string, any>, page: number, limit: number, sort: Record<string, 1 | -1>): Promise<{ data: Course[]; total: number }>;
  findAllForAdmin(filters: { instructorId?: string; status?: string; category?: string; search?: string; }): Promise<Course[]>;
  updateBaseInfo(courseId: string, updatedFields: Partial<Course>): Promise<void>;
  updateStatus(courseId: string, status: "list" | "unlist"): Promise<void>;
  deleteById(courseId: string): Promise<void>;
  getCategories(): Promise<string[]>;
  blockCourse(courseId: string, isBlocked: boolean): Promise<void>;
}


