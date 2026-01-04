import { IStudentEnrollment } from '../../types/IStudentEnrollment';

export interface IGetStudentEnrollmentsUseCase {
  execute(
    userId: string,
    page: number,
    limit: number,
    filters?: {
      search?: string;
      status?: 'active' | 'completed';
    },
  ): Promise<{ data: IStudentEnrollment[]; totalCount: number }>;
}
