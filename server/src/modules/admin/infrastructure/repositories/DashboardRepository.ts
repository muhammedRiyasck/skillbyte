import { PaymentModel } from '../../../payment/infrastructure/models/PaymentModel';
import { WithdrawalModel } from '../../../payment/infrastructure/models/WithdrawalModel';
import { WithdrawalStatus } from '../../../payment/domain/entities/Withdrawal';
import { StudentModel } from '../../../student/infrastructure/models/StudentModel';
import { InstructorModel } from '../../../instructor/infrastructure/models/InstructorModel';
import { CourseModel } from '../../../course/infrastructure/models/CourseModel';
import { EnrollmentModel } from '../../../enrollment/infrastructure/models/EnrollmentModel';
import { MentorshipBookingModel } from '../../../mentorship/infrastructure/models/MentorshipBookingModel';
import { BookingStatus } from '../../../mentorship/domain/entities/MentorshipBooking';
import { IDashboardRepository } from '../../domain/IRepositories/IDashboardRepository';
import { IAdminDashboardData } from '../../domain/interfaces/IDashboardData';

export class DashboardRepository implements IDashboardRepository {
  private readonly exchangeRate = 83;

  async getStats(): Promise<IAdminDashboardData['stats']> {
    const [payments, students, instructors, courses, withdrawals] =
      await Promise.all([
        PaymentModel.aggregate([
          { $match: { status: 'succeeded' } },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: {
                  $cond: [
                    { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                    { $divide: ['$amount', this.exchangeRate] },
                    '$amount',
                  ],
                },
              },
              adminCommission: {
                $sum: {
                  $cond: [
                    { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                    { $divide: ['$adminFee', this.exchangeRate] },
                    '$adminFee',
                  ],
                },
              },
            },
          },
        ]),
        StudentModel.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: {
                $sum: { $cond: [{ $eq: ['$accountStatus', 'active'] }, 1, 0] },
              },
              blocked: {
                $sum: { $cond: [{ $eq: ['$accountStatus', 'blocked'] }, 1, 0] },
              },
            },
          },
        ]),
        InstructorModel.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: {
                $sum: { $cond: [{ $eq: ['$accountStatus', 'active'] }, 1, 0] },
              },
              pending: {
                $sum: { $cond: [{ $eq: ['$accountStatus', 'pending'] }, 1, 0] },
              },
              suspended: {
                $sum: {
                  $cond: [{ $eq: ['$accountStatus', 'suspended'] }, 1, 0],
                },
              },
            },
          },
        ]),
        CourseModel.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              published: {
                $sum: { $cond: [{ $eq: ['$status', 'list'] }, 1, 0] },
              },
              draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
              blocked: {
                $sum: { $cond: [{ $eq: ['$isBlocked', true] }, 1, 0] },
              },
            },
          },
        ]),
        WithdrawalModel.aggregate([
          { $match: { status: WithdrawalStatus.PENDING } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              amount: { $sum: '$amount' },
            },
          },
        ]),
      ]);

    const p = payments[0] || { totalRevenue: 0, adminCommission: 0 };
    const s = students[0] || { total: 0, active: 0, blocked: 0 };
    const i = instructors[0] || {
      total: 0,
      active: 0,
      pending: 0,
      suspended: 0,
    };
    const c = courses[0] || { total: 0, published: 0, draft: 0, blocked: 0 };
    const w = withdrawals[0] || { count: 0, amount: 0 };

    return {
      totalRevenue: Math.round(p.totalRevenue * 100) / 100,
      adminCommission: Math.round(p.adminCommission * 100) / 100,
      totalStudents: s.total,
      activeStudents: s.active,
      blockedStudents: s.blocked,
      totalInstructors: i.total,
      activeInstructors: i.active,
      pendingInstructors: i.pending,
      suspendedInstructors: i.suspended,
      totalCourses: c.total,
      publishedCourses: c.published,
      draftCourses: c.draft,
      blockedCourses: c.blocked,
      pendingWithdrawals: w.count,
      pendingWithdrawalAmount: w.amount,
    };
  }

  async getRevenueTrend(
    since: Date,
  ): Promise<IAdminDashboardData['revenueTrend']> {
    return PaymentModel.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: {
            $sum: {
              $cond: [
                { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                { $divide: ['$amount', this.exchangeRate] },
                '$amount',
              ],
            },
          },
          commission: {
            $sum: {
              $cond: [
                { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                { $divide: ['$adminFee', this.exchangeRate] },
                '$adminFee',
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: { $round: ['$revenue', 2] },
          commission: { $round: ['$commission', 2] },
        },
      },
    ]);
  }

  async getRevenueTrendByYear(
    year: number,
  ): Promise<IAdminDashboardData['revenueTrend']> {
    const startDate = new Date(year, 0, 1); // Jan 1st of year
    const endDate = new Date(year + 1, 0, 1); // Jan 1st of next year

    const results = await PaymentModel.aggregate([
      {
        $match: {
          status: 'succeeded',
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: {
            $sum: {
              $cond: [
                { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                { $divide: ['$amount', this.exchangeRate] },
                '$amount',
              ],
            },
          },
          commission: {
            $sum: {
              $cond: [
                { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                { $divide: ['$adminFee', this.exchangeRate] },
                '$adminFee',
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: { $round: ['$revenue', 2] },
          commission: { $round: ['$commission', 2] },
        },
      },
    ]);

    // Fill all 12 months even if there's no data
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
    return months.map((monthName, idx) => {
      const yearMonth = `${year}-${String(idx + 1).padStart(2, '0')}`;
      const existing = results.find((r) => r.date === yearMonth);
      return {
        date: monthName,
        revenue: existing ? existing.revenue : 0,
        commission: existing ? existing.commission : 0,
      };
    });
  }

  async getRecentPayments(): Promise<IAdminDashboardData['recentPayments']> {
    const payments = await PaymentModel.find({ status: 'succeeded' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return payments.map((p) => ({
      amount: p.amount,
      currency: p.currency,
      adminFee: p.adminFee,
      productName: p.productName || 'Unknown Course',
      studentName: p.studentName || 'Unknown Student',
    }));
  }

  async getCategoryDistribution(): Promise<
    IAdminDashboardData['categoryDistribution']
  > {
    return CourseModel.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, category: '$_id', count: 1 } },
    ]);
  }

  async getPlatformHealth(): Promise<IAdminDashboardData['platformHealth']> {
    const [avgProgress, avgRating, mentorshipStats] = await Promise.all([
      EnrollmentModel.aggregate([
        { $group: { _id: null, avg: { $avg: '$progress' } } },
      ]),
      InstructorModel.aggregate([
        { $match: { approved: true, totalReviews: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$averageRating' } } },
      ]),
      MentorshipBookingModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status', BookingStatus.COMPLETED] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const m = mentorshipStats[0] || { total: 0, completed: 0 };
    return {
      avgCompletionRate: avgProgress[0]?.avg || 0,
      avgInstructorRating: avgRating[0]?.avg || 0,
      mentorshipCompletionRate: m.total > 0 ? (m.completed / m.total) * 100 : 0,
    };
  }

  async getCoursesAwaitingReview(): Promise<number> {
    return CourseModel.countDocuments({
      isBlocked: false,
      status: 'list',
    });
  }
}
