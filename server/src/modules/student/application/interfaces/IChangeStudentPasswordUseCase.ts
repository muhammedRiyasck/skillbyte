import { ChangeStudentPasswordDto } from '../../entry-points/validations/ChangeStudentPasswordValidation';

/**
 * Interface for the ChangeStudentPassword use case.
 */
export interface IChangeStudentPasswordUseCase {
  execute(studentId: string, dto: ChangeStudentPasswordDto): Promise<void>;
}
