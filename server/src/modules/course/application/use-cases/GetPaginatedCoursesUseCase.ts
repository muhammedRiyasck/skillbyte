import { Course } from "../../domain/entities/Course";
import { ICourseRepository } from "../../domain/IRepositories/ICourseRepository";
import { IGetPaginatedCoursesUseCase } from "../interfaces/IGetPaginatedCoursesUseCase";
import { PaginatedResult } from "../../../../shared/types/PaginationType";

/**
 * Query filters for paginated courses.
 */
type CourseQuery = {
  instructorId?: string;
  status?: string;
};

/**
 * Sort options for courses.
 */
type CourseSort = Record<string, 1 | -1>;

/**
 * Use case for retrieving paginated courses with optional filters and sorting.
 * Handles the business logic for fetching courses in a paginated manner, including validation of pagination parameters.
 */
export class GetPaginatedCoursesUseCase implements IGetPaginatedCoursesUseCase {
  /**
   * Constructs a new GetPaginatedCoursesUseCase instance.
   * @param courseRepo - The repository for course data operations.
   */
  constructor(private _courseRepo: ICourseRepository) {}

  /**
   * Executes the paginated course retrieval logic.
   * Validates and sanitizes pagination parameters, applies filters and sorting, and returns paginated results.
   * @param query - Optional filters for the courses (instructorId, status).
   * @param page - The page number to retrieve (defaults to 1 if invalid).
   * @param limit - The number of items per page (defaults to 6, max 50).
   * @param sort - Sorting options for the results.
   * @returns A promise that resolves to a PaginatedResult containing the courses and pagination metadata.
   */
  async execute(
    query: CourseQuery,
    page: number,
    limit: number,
    sort: CourseSort,
  ): Promise<PaginatedResult<Course> | null> {
    // Validate and sanitize the page number
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;

    // Validate and sanitize the limit, with a maximum cap
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;

    // Fetch paginated data from the repository
    const { data, total } = await this._courseRepo.listPaginated(query, safePage, safeLimit, sort);

    // Calculate total pages
    const totalPages = Math.ceil(total / safeLimit);

    // Return the paginated result with metadata
    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        totalItems: total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }
}
