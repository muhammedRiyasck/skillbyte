import { Course } from "../../domain/entities/Course";

export interface IGetAllCoursesForAdminUseCase {
execute(filters: {
  instructorId?: string;
  status?: string;
  category?: string;
  search?: string;
}): Promise<Course[]>
}
