import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IlistInstructorsUC } from '../interfaces/IlistInstructorsUseCase';
import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { InstructorMapper } from '../mappers/InstructorMapper';
import { AdminInstructorMapper } from '../mappers/AdminInstructorMapper';
import { AdminInstructorPaginationRequestDto } from '../dtos/AdminInstructorRequestDto';

/**
 * Use case for listing instructors with pagination and sorting.
 * Retrieves a paginated list of instructors based on query filters.
 */
export class ListInstructorsUseCase implements IlistInstructorsUC {
  /**
   * Constructs the ListInstructorsUseCase.
   * @param repo - The instructor repository for data operations.
   */
  constructor(private _instructorRepo: IInstructorRepository) {}

  /**
   * Executes the listing of instructors.
   * Maps the raw query DTO to filter/sort, applies safe pagination defaults,
   * fetches paginated data, and returns with metadata.
   * @param query - Raw pagination/filter DTO from the controller.
   * @param page - The page number for pagination (defaults to 1 if invalid).
   * @param limit - The number of items per page (defaults to 6, max 50).
   * @returns A promise that resolves to an object containing data and pagination metadata.
   */
  async execute(
    query: AdminInstructorPaginationRequestDto,
    page: number,
    limit: number,
  ): Promise<{
    data: InstructorResponseDto[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  } | null> {
    const filter = AdminInstructorMapper.toGetInstructorsFilter(query);
    const sort = AdminInstructorMapper.toSort(query.sort);

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;
    const { data, total } = await this._instructorRepo.paginatedList(
      filter,
      page,
      limit,
      sort,
    );
    const totalPages = Math.ceil(total / safeLimit);
    return {
      data: data.map((instructor) =>
        InstructorMapper.toResponseDto(instructor),
      ),
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
