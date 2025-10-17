import { Course } from "../../domain/entities/Course";
import { PaginatedResult } from "../../../../shared/types/PaginationType";
type GetPaginatedCourses<T = Course> = PaginatedResult<T>;

export interface IGetPaginatedCoursesUseCase {
  execute(
    query: { instructorId?: string; status?: string },
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<GetPaginatedCourses | null>; // or a specific DTO type
}








