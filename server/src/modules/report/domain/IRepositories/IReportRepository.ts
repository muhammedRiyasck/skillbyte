import { IBaseRepository } from '../../../../shared/repositories/IBaseRepository';
import { Report } from '../entities/Report';

export interface IReportRepository extends IBaseRepository<Report> {
  findByStatus(
    status: 'pending' | 'dismissed' | 'actioned',
    page: number,
    limit: number,
  ): Promise<{ reports: Report[]; total: number }>;

  hasUserReportedTarget(
    studentId: string,
    targetType: string,
    targetId: string,
  ): Promise<boolean>;

  updateStatus(
    reportId: string,
    status: 'pending' | 'dismissed' | 'actioned',
  ): Promise<void>;

  deleteManyByTarget(targetType: string, targetId: string): Promise<void>;
}
