import { StudentResponseDto } from '../dtos/StudentResponseDto';

export interface IGetStudentProfileUseCase {
  execute(id: string): Promise<StudentResponseDto | null>;
}
