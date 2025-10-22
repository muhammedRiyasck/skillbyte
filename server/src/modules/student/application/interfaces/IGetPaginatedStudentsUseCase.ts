import { Student } from "../../domain/entities/Student";
import { PaginatedResult } from "../../../../shared/types/PaginationType";

type GetPaginatedStudents<T = Student> = PaginatedResult<T>;

export interface IGetPaginatedStudentsUseCase {
  execute(
    query: Record<string, any>,
    page: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<GetPaginatedStudents | null>;
}
