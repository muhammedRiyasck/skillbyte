import { Report } from '../../domain/entities/Report';

export interface IGetPendingReportsUseCase {
  execute(
    page: number,
    limit: number,
  ): Promise<{ reports: Report[]; total: number }>;
}
