import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import { IlistInstructorsUC } from '../interfaces/IlistInstructorsUseCase';

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
   * Applies safe pagination defaults, fetches paginated data, and returns with metadata.
   * @param query - The query object for filtering instructors.
   * @param page - The page number for pagination (defaults to 1 if invalid).
   * @param limit - The number of items per page (defaults to 6, max 50).
   * @param sort - The sort criteria as a record of field to direction.
   * @returns A promise that resolves to an object containing data and pagination metadata.
   * @throws Error if the listing fails.
   */
  async execute(
    query: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{
    data: Instructor[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6;
    const { data, total } = await this._instructorRepo.paginatedList(
      query,
      page,
      limit,
      sort,
    );
    const totalPages = Math.ceil(total / safeLimit);
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
