export interface AdminDashboardData {
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
    revenueTrend: Array<{ date: string; revenue: number; commission: number }>;
    recentPayments: Array<{
        _id: string;
        amount: number;
        currency: string;
        adminFee: number;
        productName: string;
        studentName: string;
    }>;
    topInstructors: Array<{
        _id: string;
        name: string;
        profilePictureUrl?: string;
        totalEarnings: number;
        averageRating: number;
        totalReviews: number;
    }>;
    pendingActions: {
        instructorApplications: number;
        pendingWithdrawals: number;
        coursesAwaitingReview: number;
    };
    categoryDistribution: Array<{ category: string; count: number }>;
    platformHealth: {
        avgCompletionRate: number;
        avgInstructorRating: number;
        mentorshipCompletionRate: number;
    };
}
