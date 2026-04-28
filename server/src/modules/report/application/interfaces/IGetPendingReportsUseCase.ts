import { Report } from '../../domain/entities/Report';
import { ReportFilterOptions } from '../../domain/IRepositories/IReportRepository';

export interface IGetPendingReportsUseCase {
  execute(
    filters: ReportFilterOptions,
  ): Promise<{ reports: Report[]; total: number }>;
}
