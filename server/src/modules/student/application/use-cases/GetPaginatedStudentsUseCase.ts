import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IGetPaginatedStudentsUseCase } from '../interfaces/IGetPaginatedStudentsUseCase';
import { PaginatedResult } from '../../../../shared/types/PaginationType';
import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { StudentMapper } from '../mappers/StudentMapper';
import { AdminStudentMapper } from '../mappers/AdminStudentMapper';
import { AdminStudentPaginationRequestDto } from '../dtos/AdminStudentRequestDto';

/** Executes the business logic for get paginated students. */
export class GetPaginatedStudentsUseCase
  implements IGetPaginatedStudentsUseCase
{
  /**
   * Constructs a new GetPaginatedStudentsUseCase instance.
   * @param _studentRepo - The repository for student data operations.
   */
  constructor(private _studentRepo: IStudentRepository) {}

  /**
   * Execute for the GetPaginatedStudents entity.
   *
   * @param query - The query information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @returns The standardized HTTP response.
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

    const { data, total } = await this._studentRepo.paginatedList(
      filter,
      safePage,
      safeLimit,
      sort,
    );

    // Calculate total pages
    const totalPages = Math.ceil(total / safeLimit);

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
