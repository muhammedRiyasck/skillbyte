import {
  IAdminDashboardData,
  IGetDashboardDataUseCase,
} from '../interfaces/IGetDashboardDataUseCase';
import { ITopInstructorRepository } from '../../domain/IRepositories/ITopInstructorRepository';
import { IDashboardRepository } from '../../domain/IRepositories/IDashboardRepository';

export class GetDashboardDataUseCase implements IGetDashboardDataUseCase {
  constructor(
    private readonly dashboardRepository: IDashboardRepository,
    private readonly topInstructorRepository: ITopInstructorRepository,
  ) {}

  async execute(): Promise<IAdminDashboardData> {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const [
      stats,
      revenueTrend,
      recentPayments,
      topInstructors,
      categoryDistribution,
      platformHealth,
      coursesAwaitingReview,
    ] = await Promise.all([
      this.dashboardRepository.getStats(),
      this.dashboardRepository.getRevenueTrend(sixMonthsAgo),
      this.dashboardRepository.getRecentPayments(),
      this.topInstructorRepository.getTopInstructors(),
      this.dashboardRepository.getCategoryDistribution(),
      this.dashboardRepository.getPlatformHealth(),
      this.dashboardRepository.getCoursesAwaitingReview(),
    ]);

    return {
      stats,
      revenueTrend,
      recentPayments,
      topInstructors,
      categoryDistribution,
      platformHealth,
      pendingActions: {
        instructorApplications: stats.pendingInstructors,
        pendingWithdrawals: stats.pendingWithdrawals,
        coursesAwaitingReview,
      },
    };
  }
}
