import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { IlistInstructorsUC } from '../interfaces/IlistInstructorsUseCase';
import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { InstructorMapper } from '../mappers/InstructorMapper';
import { AdminInstructorMapper } from '../mappers/AdminInstructorMapper';
import { AdminInstructorPaginationRequestDto } from '../dtos/AdminInstructorRequestDto';

/** Executes the business logic for list instructors. */
export class ListInstructorsUseCase implements IlistInstructorsUC {
  /**
   * Constructs the ListInstructorsUseCase.
   * @param repo - The instructor repository for data operations.
   */
  constructor(private _instructorRepo: IInstructorRepository) {}

  /**
   * Execute for the ListInstructors entity.
   *
   * @param query - The query information.
   * @param page - The page information.
   * @param limit - The limit information.
   * @returns The standardized HTTP response.
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
