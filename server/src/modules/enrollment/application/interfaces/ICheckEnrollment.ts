import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';

export interface ICheckEnrollmentUseCase {
  execute(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentResponseDto | null>;
}
