import { IAdminDashboardData } from '../../application/interfaces/IGetDashboardDataUseCase';

export interface IDashboardRepository {
  getStats(): Promise<IAdminDashboardData['stats']>;
  getRevenueTrend(since: Date): Promise<IAdminDashboardData['revenueTrend']>;
  getRecentPayments(): Promise<IAdminDashboardData['recentPayments']>;
  getCategoryDistribution(): Promise<IAdminDashboardData['categoryDistribution']>;
  getPlatformHealth(): Promise<IAdminDashboardData['platformHealth']>;
  getCoursesAwaitingReview(): Promise<number>;
}
