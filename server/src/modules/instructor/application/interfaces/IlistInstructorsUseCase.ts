import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import { PaginatedResult } from '../../../../shared/types/PaginationType';
import { AdminInstructorPaginationRequestDto } from '../dtos/AdminInstructorRequestDto';

type GetPaginatedInstructors<T = InstructorResponseDto> = PaginatedResult<T>;

export interface IlistInstructorsUC {
  execute(
    query: AdminInstructorPaginationRequestDto,
    page: number,
    limit: number,
  ): Promise<GetPaginatedInstructors | null>;
}
