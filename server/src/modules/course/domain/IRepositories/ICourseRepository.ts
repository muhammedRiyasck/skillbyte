import { Course } from "../entities/Course";

export interface ICourseRepository {
  save(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  update(courseId: string, updatedFields: Partial<Course>): Promise<void>;
  deleteById(courseId: string): Promise<void>;
  updateStatus(courseId: string, status: "published" | "unpublished"): Promise<void>;
  findPublishedCourses(filters: {search?: string;category?: string;price?: 'free' | 'paid';}): Promise<Course[]>;
  findByInstructorId(instructorId: string): Promise<Course[]>;
  findAllForAdmin(filters: {instructorId?: string; status?: string; category?: string;search?: string;}): Promise<Course[]>;

}

