import { StudentResponseDto } from '../dtos/StudentResponseDto';
import { PaginatedResult } from '../../../../shared/types/PaginationType';
import { AdminStudentPaginationRequestDto } from '../dtos/AdminStudentRequestDto';

type GetPaginatedStudents<T = StudentResponseDto> = PaginatedResult<T>;

export interface IGetPaginatedStudentsUseCase {
  execute(
    query: AdminStudentPaginationRequestDto,
    page: number,
    limit: number,
  ): Promise<GetPaginatedStudents | null>;
}
