import { Student } from "../../domain/entities/Student";
import { IStudentRepository } from "../../domain/IRepositories/IStudentRepository";
import { IGetPaginatedStudentsUseCase } from "../interfaces/IGetPaginatedStudentsUseCase";
import { PaginatedResult } from "../../../../shared/types/PaginationType";

/**
 * Query filters for paginated students.
 */
type StudentQuery = Record<string, any>;

/**
 * Sort options for students.
 */
type StudentSort = Record<string, 1 | -1>;

/**
 * Use case for retrieving paginated students with optional filters and sorting.
 * Handles the business logic for fetching students in a paginated manner, including validation of pagination parameters.
 */
export class GetPaginatedStudentsUseCase implements IGetPaginatedStudentsUseCase {
  /**
   * Constructs a new GetPaginatedStudentsUseCase instance.
   * @param _studentRepo - The repository for student data operations.
   */
  constructor(private _studentRepo: IStudentRepository) {}

  /**
   * Executes the paginated student retrieval logic.
   * Validates and sanitizes pagination parameters, applies filters and sorting, and returns paginated results.
   * @param query - Optional filters for the students.
   * @param page - The page number to retrieve (defaults to 1 if invalid).
   * @param limit - The number of items per page (defaults to 6, max 50).
   * @param sort - Sorting options for the results.
   * @returns A promise that resolves to a PaginatedResult containing the students and pagination metadata.
   */
  async execute(
    query: StudentQuery,
    page: number,
    limit: number,
    sort: StudentSort,
  ): Promise<PaginatedResult<Student> | null> {
    // Validate and sanitize the page number
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;

    // Validate and sanitize the limit, with a maximum cap
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;

    // Fetch paginated data from the repository
    const { data, total } = await this._studentRepo.listPaginated(query, safePage, safeLimit, sort);

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
