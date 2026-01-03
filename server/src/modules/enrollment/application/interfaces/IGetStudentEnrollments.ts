import { IStudentEnrollment } from '../../types/IStudentEnrollment';

export interface IGetStudentEnrollmentsUseCase {
  execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }>;
}
