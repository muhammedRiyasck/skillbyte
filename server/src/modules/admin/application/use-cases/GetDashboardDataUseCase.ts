import { IGetDashboardDataUseCase } from '../interfaces/IGetDashboardDataUseCase';
import { AdminDashboardResponseDto } from '../dtos/AdminResponseDto';
import { ITopInstructorRepository } from '../../domain/IRepositories/ITopInstructorRepository';
import { IDashboardRepository } from '../../domain/IRepositories/IDashboardRepository';

export class GetDashboardDataUseCase implements IGetDashboardDataUseCase {
  constructor(
    private readonly dashboardRepository: IDashboardRepository,
    private readonly topInstructorRepository: ITopInstructorRepository,
  ) {}

  async execute(): Promise<AdminDashboardResponseDto> {
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(today.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

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
      this.dashboardRepository.getRevenueTrend(twelveMonthsAgo),
      this.dashboardRepository.getRecentPayments(),
      this.topInstructorRepository.getTopInstructors(),
      this.dashboardRepository.getCategoryDistribution(),
      this.dashboardRepository.getPlatformHealth(),
      this.dashboardRepository.getCoursesAwaitingReview(),
    ]);

    // Fill missing months for the 12-month rolling history
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const filledRevenueTrend = [];

    for (let i = 0; i < 12; i++) {
      const d = new Date(twelveMonthsAgo);
      d.setMonth(twelveMonthsAgo.getMonth() + i);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = months[d.getMonth()];

      const existingData = revenueTrend.find((r) => r.date === yearMonth);
      filledRevenueTrend.push({
        date: monthName,
        revenue: existingData ? existingData.revenue : 0,
        commission: existingData ? existingData.commission : 0,
      });
    }

    return {
      stats,
      revenueTrend: filledRevenueTrend,
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
