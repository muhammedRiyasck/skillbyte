import { ChangeInstructorPasswordDto } from '../../entry-point/validations/ChangeInstructorPasswordValidation';

/**
 * Interface for the ChangeInstructorPassword use case.
 */
export interface IChangeInstructorPasswordUseCase {
  execute(
    instructorId: string,
    dto: ChangeInstructorPasswordDto,
  ): Promise<void>;
}
