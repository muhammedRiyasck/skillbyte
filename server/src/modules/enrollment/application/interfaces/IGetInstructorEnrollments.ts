import { ICourseEnrollmentSummary } from '../../types/IInstructorEnrollment';

export interface IGetInstructorEnrollmentsUseCase {
  execute(instructorId: string): Promise<ICourseEnrollmentSummary[]>;
}
