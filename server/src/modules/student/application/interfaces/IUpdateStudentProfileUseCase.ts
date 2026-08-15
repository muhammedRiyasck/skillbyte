import { Student } from '../../domain/entities/Student';

export interface IUpdateStudentProfileUseCase {
  execute(
    id: string,
    updates: Partial<Pick<Student, 'name' | 'profilePictureUrl'>>,
  ): Promise<void>;
}
