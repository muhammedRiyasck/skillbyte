import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IGetPaginatedStudentsUseCase } from '../interfaces/IGetPaginatedStudentsUseCase';
import { PaginatedResult } from '../../../../shared/types/PaginationType';
import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { StudentMapper } from '../mappers/StudentMapper';
import { AdminStudentMapper } from '../mappers/AdminStudentMapper';
import { AdminStudentPaginationRequestDto } from '../dtos/AdminStudentRequestDto';

/**
 * Use case for retrieving paginated students with optional filters and sorting.
 * Handles the business logic for fetching students in a paginated manner, including validation of pagination parameters.
 */
export class GetPaginatedStudentsUseCase
  implements IGetPaginatedStudentsUseCase
{
  /**
   * Constructs a new GetPaginatedStudentsUseCase instance.
   * @param _studentRepo - The repository for student data operations.
   */
  constructor(private _studentRepo: IStudentRepository) {}

  /**
   * Executes the paginated student retrieval logic.
   * Validates and sanitizes pagination parameters, applies filters and sorting, and returns paginated results.
   * @param query - Raw pagination/filter DTO from the controller.
   * @param page - The page number to retrieve (defaults to 1 if invalid).
   * @param limit - The number of items per page (defaults to 6, max 50).
   * @returns A promise that resolves to a PaginatedResult containing the students and pagination metadata.
   */
  async execute(
    query: AdminStudentPaginationRequestDto,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<StudentResponseDto> | null> {
    const filter = AdminStudentMapper.toListAllFilter(query);
    const sort = AdminStudentMapper.toSort(query.sort);

    // Validate and sanitize the page number
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;

    // Validate and sanitize the limit, with a maximum cap
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;

    // Fetch paginated data from the repository
    const { data, total } = await this._studentRepo.paginatedList(
      filter,
      safePage,
      safeLimit,
      sort,
    );

    // Calculate total pages
    const totalPages = Math.ceil(total / safeLimit);

    // Return the paginated result with metadata
    return {
      data: data.map((student) => StudentMapper.toResponseDto(student)),
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
