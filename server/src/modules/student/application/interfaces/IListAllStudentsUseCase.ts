import { StudentResponseDto } from '../dtos/StudentResponseDto';

export interface IListAllStudentsUseCase {
  execute(): Promise<StudentResponseDto[] | null>;
}
