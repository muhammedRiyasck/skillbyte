import { IAdminDashboardData } from '../interfaces/IDashboardData';

export interface IDashboardRepository {
  getStats(): Promise<IAdminDashboardData['stats']>;
  getRevenueTrend(since: Date): Promise<IAdminDashboardData['revenueTrend']>;
  getRevenueTrendByYear(
    year: number,
  ): Promise<IAdminDashboardData['revenueTrend']>;
  getRecentPayments(): Promise<IAdminDashboardData['recentPayments']>;
  getCategoryDistribution(): Promise<
    IAdminDashboardData['categoryDistribution']
  >;
  getPlatformHealth(): Promise<IAdminDashboardData['platformHealth']>;
  getCoursesAwaitingReview(): Promise<number>;
}
