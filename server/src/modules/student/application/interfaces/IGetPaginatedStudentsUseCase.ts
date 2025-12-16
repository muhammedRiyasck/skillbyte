import { Student } from '../../domain/entities/Student';
import { PaginatedResult } from '../../../../shared/types/PaginationType';

type GetPaginatedStudents<T = Student> = PaginatedResult<T>;

export interface IGetPaginatedStudentsUseCase {
  execute(
    filter: Record<string, unknown>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<GetPaginatedStudents | null>;
}
