import { EnrollmentResponseDto } from '../dtos/EnrollmentResponseDto';

export interface ICheckEnrollment {
  execute(
    userId: string,
    courseId: string,
  ): Promise<EnrollmentResponseDto | null>;
}
