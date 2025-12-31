import { Instructor } from '../../domain/entities/Instructor';
import { PaginatedResult } from '../../../../shared/types/PaginationType';
type GetPaginatedInstructors<T = Instructor> = PaginatedResult<T>;

export interface IlistInstructorsUC {
  execute(
    query: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<GetPaginatedInstructors | null>;
}
