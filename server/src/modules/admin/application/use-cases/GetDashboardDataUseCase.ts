import { PaymentModel } from '../../../payment/infrastructure/models/PaymentModel';
import {
  WithdrawalModel,
  WithdrawalStatus,
} from '../../../payment/infrastructure/models/WithdrawalModel';
import { StudentModel } from '../../../student/infrastructure/models/StudentModel';
import { InstructorModel } from '../../../instructor/infrastructure/models/InstructorModel';
import { CourseModel } from '../../../course/infrastructure/models/CourseModel';
import { EnrollmentModel } from '../../../enrollment/infrastructure/models/EnrollmentModel';
import { MentorshipBookingModel } from '../../../mentorship/infrastructure/models/MentorshipBookingModel';
import { BookingStatus } from '../../../mentorship/domain/entities/MentorshipBooking';
import {
  IAdminDashboardData,
  IGetDashboardDataUseCase,
} from '../interfaces/IGetDashboardDataUseCase';
import { ITopInstructorRepository } from '../../domain/IRepositories/ITopInstructorRepository';

export class GetDashboardDataUseCase implements IGetDashboardDataUseCase {
  constructor(private topInstructorRepository: ITopInstructorRepository) {}
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
    ] = await Promise.all([
      this.getStats(),
      this.getRevenueTrend(sixMonthsAgo),
      this.getRecentPayments(),
      this.getTopInstructors(),
      this.getCategoryDistribution(),
      this.getPlatformHealth(),
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
        // Assuming courses awaiting review are those with status 'PULL_REQUEST' if applicable or just count total courses
        coursesAwaitingReview: await CourseModel.countDocuments({
          isBlocked: false,
          status: 'PUBLISHED',
        }), // Simplified for now
      },
    };
  }

  private async getStats() {
    const exchangeRate = 83;

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
                    { $divide: ['$amount', exchangeRate] },
                    '$amount',
                  ],
                },
              },
              adminCommission: {
                $sum: {
                  $cond: [
                    { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                    { $divide: ['$adminFee', exchangeRate] },
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
                $sum: { $cond: [{ $eq: ['$status', 'PUBLISHED'] }, 1, 0] },
              },
              draft: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
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

  private async getRevenueTrend(since: Date) {
    const exchangeRate = 83;

    return PaymentModel.aggregate([
      { $match: { status: 'succeeded', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: {
            $sum: {
              $cond: [
                { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                { $divide: ['$amount', exchangeRate] },
                '$amount',
              ],
            },
          },
          commission: {
            $sum: {
              $cond: [
                { $eq: [{ $toUpper: '$currency' }, 'INR'] },
                { $divide: ['$adminFee', exchangeRate] },
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

  private async getRecentPayments() {
    return PaymentModel.find({ status: 'succeeded' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }

  private async getTopInstructors() {
    return this.topInstructorRepository.getTopInstructors();
  }

  private async getCategoryDistribution() {
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

  private async getPlatformHealth() {
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
}
