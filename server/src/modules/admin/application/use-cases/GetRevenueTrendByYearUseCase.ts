import { IDashboardRepository } from '../../domain/IRepositories/IDashboardRepository';
import { IAdminDashboardData } from '../../domain/interfaces/IDashboardData';

/** Executes the business logic for get revenue trend by year. */
export class GetRevenueTrendByYearUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  /**
   * Execute for the GetRevenueTrendByYear entity.
   *
   * @param year - The year information.
   * @returns The result of the operation.
   */
  async execute(year: number): Promise<IAdminDashboardData['revenueTrend']> {
    return this.dashboardRepository.getRevenueTrendByYear(year);
  }
}
