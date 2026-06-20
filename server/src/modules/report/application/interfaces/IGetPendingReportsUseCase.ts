import { ReportFilterOptions } from '../../domain/IRepositories/IReportRepository';
import { PendingReportsResponseDto } from '../dtos/PendingReportsResponseDto';

export interface IGetPendingReportsUseCase {
  execute(filters: ReportFilterOptions): Promise<PendingReportsResponseDto>;
}
