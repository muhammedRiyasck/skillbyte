export interface IAdminDashboardData {
  stats: {
    totalRevenue: number;
    adminCommission: number;
    totalStudents: number;
    activeStudents: number;
    blockedStudents: number;
    totalInstructors: number;
    activeInstructors: number;
    pendingInstructors: number;
    suspendedInstructors: number;
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    blockedCourses: number;
    pendingWithdrawals: number;
    pendingWithdrawalAmount: number;
  };
  revenueTrend: Array<{
    date: string;
    revenue: number;
    commission: number;
  }>;
  recentPayments: Array<{
    amount: number;
    currency: string;
    adminFee: number;
    productName: string;
    studentName: string;
  }>;
  topInstructors: Array<{
    name: string;
    profilePictureUrl: string | null;
    totalEarnings: number;
    averageRating: number;
    totalReviews: number;
  }>;
  pendingActions: {
    instructorApplications: number;
    pendingWithdrawals: number;
    coursesAwaitingReview: number;
  };
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
  platformHealth: {
    avgCompletionRate: number;
    avgInstructorRating: number;
    mentorshipCompletionRate: number;
  };
}
