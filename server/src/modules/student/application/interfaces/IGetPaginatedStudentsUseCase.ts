import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { PaginatedResult } from '../../../../shared/types/PaginationType';

type GetPaginatedStudents<T = StudentResponseDto> = PaginatedResult<T>;

export interface IGetPaginatedStudentsUseCase {
  execute(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<GetPaginatedStudents | null>;
}
