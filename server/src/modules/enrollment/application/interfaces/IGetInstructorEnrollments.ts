import {
  ICourseEnrollmentSummary,
  IEnrollmentFilters,
} from '../../types/IInstructorEnrollment';

export interface IGetInstructorEnrollmentsUseCase {
  execute(
    instructorId: string,
    page: number,
    limit: number,
    filters?: IEnrollmentFilters,
  ): Promise<ICourseEnrollmentSummary>;
}
