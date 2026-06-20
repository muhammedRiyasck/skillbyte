import { EnrollmentResponseDto } from './EnrollmentResponseDto';

export interface CheckEnrollmentResponseDto {
  isEnrolled: boolean;
  enrollment: EnrollmentResponseDto | null;
}
