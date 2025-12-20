import { ICourseEnrollmentSummary } from '../../types/IInstructorEnrollment';

export interface IGetInstructorEnrollmentsUseCase {
  execute(
    instructorId: string,
    page: number,
    limit: number,
  ): Promise<ICourseEnrollmentSummary>;
}
