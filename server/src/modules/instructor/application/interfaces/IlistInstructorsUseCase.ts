import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { PaginatedResult } from '../../../../shared/types/PaginationType';
type GetPaginatedInstructors<T = InstructorResponseDto> = PaginatedResult<T>;

export interface IlistInstructorsUC {
  execute(
    query: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<GetPaginatedInstructors | null>;
}
