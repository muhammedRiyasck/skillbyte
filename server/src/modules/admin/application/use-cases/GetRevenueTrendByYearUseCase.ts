import { IDashboardRepository } from '../../domain/IRepositories/IDashboardRepository';
import { IAdminDashboardData } from '../../domain/interfaces/IDashboardData';

export class GetRevenueTrendByYearUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  async execute(year: number): Promise<IAdminDashboardData['revenueTrend']> {
    return this.dashboardRepository.getRevenueTrendByYear(year);
  }
}
