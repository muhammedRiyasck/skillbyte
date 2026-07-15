import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSocket } from '../../../context/SocketContext';
import {
    getDashboardEarnings,
    getDashboardEnrollments,
    getDashboardCourseCount,
    getDashboardBookings,
    getInstructorProfile,
    createStripeOnboardingLink,
    getMyWithdrawals,
    requestWithdrawal,
    syncStripeStatus
} from '../services/InstructorDashboardService';
import { getStats } from '../constants/instructorDashboard';

export interface DashboardEarnings {
    id: string;
    productName: string;
    amount: number;
    currency: string;
    createdAt?: string | Date;
}

export interface EarningsTrendPoint {
    date: string;
    revenue: number;
    profit: number;
    enrollments: number;
}

export interface DashboardCourse {
    id: string;
    courseThumbnail?: string;
    courseTitle: string;
    coursePrice: number;
    enrollments: { studentId: string; studentName: string; studentEmail: string; enrollmentDate: Date; status: string; progress: number }[];
}

export interface DashboardBooking {
    bookingId: string;
    studentId: string;
    scheduledAt: string | Date;
    status: string;
    amount: number;
    currency: string;
}

export interface WithdrawalItem {
    withdrawalId: string;
    amount: number;
    status: string;
    currency: string;
    createdAt?: string | Date;
}

export interface DashboardStat {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    link: string;
    subValue?: string;
}

export interface InstructorProfile {
    name?: string;
    profilePicture?: string;
    stripeAccountId?: string;
    isStripeVerified?: boolean;
    totalEarnings?: number;
    withdrawnAmount?: number;
    averageRating?: number;
    totalReviews?: number;
}

export const useInstructorDashboard = () => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const [withdrawalPage, setWithdrawalPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const { data: earningsData } = useQuery<{ data: DashboardEarnings[]; totalCount: number; totalRevenue: number; totalProfit: number; trend: EarningsTrendPoint[] }>({
        queryKey: ['instructor-dashboard-earnings'],
        queryFn: () => getDashboardEarnings(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery<{ data: DashboardCourse[]; totalCount: number; totalStudents: number }>({
        queryKey: ['instructor-dashboard-enrollments'],
        queryFn: getDashboardEnrollments,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const { data: courseData, isLoading: coursesLoading } = useQuery<{ meta: { totalItems: number } }>({
        queryKey: ['instructor-dashboard-course-count'],
        queryFn: getDashboardCourseCount,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const { data: bookingsData, isLoading: bookingsLoading } = useQuery<{ bookings: DashboardBooking[] }>({
        queryKey: ['instructor-dashboard-bookings'],
        queryFn: getDashboardBookings,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const { data: profileData, isLoading: profileLoading } = useQuery<InstructorProfile>({
        queryKey: ['instructor-profile'],
        queryFn: getInstructorProfile,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const { data: withdrawalsData, isFetching: withdrawalsFetching, refetch: refetchWithdrawals } = useQuery<{ data: WithdrawalItem[]; pagination: { total: number; page: number; limit: number } }>({
        queryKey: ['instructor-withdrawals', withdrawalPage],
        queryFn: () => getMyWithdrawals(withdrawalPage, ITEMS_PER_PAGE),
        placeholderData: keepPreviousData,
        staleTime: 0,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (notification: { title?: string }) => {
            const shouldRefresh = 
                (notification.title && notification.title.includes('Withdrawal')) ||
                (notification.title && notification.title.includes('Verified'));

            if (shouldRefresh) {
                queryClient.invalidateQueries({ queryKey: ['instructor-profile'] });
                queryClient.invalidateQueries({ queryKey: ['instructor-withdrawals'] });
                queryClient.invalidateQueries({ queryKey: ['instructor-dashboard-earnings'] });
            }
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, queryClient]);

    const [isOnboarding, setIsOnboarding] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSetupPayouts = async () => {
        try {
            setIsOnboarding(true);
            const response = await createStripeOnboardingLink();
            if (response.data?.url) {
                window.location.href = response.data.url;
            } else {
                toast.error('Failed to create onboarding link');
            }
        } catch (error) {
            console.error('Stripe onboarding error:', error);
            toast.error('Something went wrong. Please try again later.');
        } finally {
            setIsOnboarding(false);
        }
    };

    const handleRequestWithdrawal = async (amount: number) => {
        try {
            setIsWithdrawing(true);
            await requestWithdrawal(amount);
            toast.success('Withdrawal request submitted! It will be processed soon.');
            refetchWithdrawals();
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handleRefreshStatus = async () => {
        try {
            setIsSyncing(true);
            const result = await syncStripeStatus();
            if (result.success) {
                if (result.data.isVerified) {
                    toast.success('Your Stripe account is verified! Payouts are now enabled.');
                } else {
                    toast.info('Stripe setup is still in progress. Please complete all required information.');
                }
                queryClient.invalidateQueries({ queryKey: ['instructor-profile'] });
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to sync Stripe status');
        } finally {
            setIsSyncing(false);
        }
    };

    const isInitialLoading = profileLoading || enrollmentLoading || coursesLoading || bookingsLoading;
    const isLoading = isInitialLoading && !profileData;

    const earnings = useMemo(() => {
        const raw = earningsData?.data;
        return Array.isArray(raw) ? raw : [];
    }, [earningsData]);

    const totalProfit = earningsData?.totalProfit || 0;
    const totalStudents = enrollmentData?.totalStudents || 0;
    const totalCourses = courseData?.meta?.totalItems || 0;
    const courses = enrollmentData?.data || [];
    const bookings = bookingsData?.bookings || [];
    const withdrawals = withdrawalsData?.data || [];

    const instructor = profileData;
    const availableBalance = (instructor?.totalEarnings || 0) - (instructor?.withdrawnAmount || 0);
    const USD_TO_INR = 83;
    const availableBalanceINR = Math.round(availableBalance * USD_TO_INR);

    const stats = getStats(totalProfit, totalStudents, totalCourses, bookings);

    const chartData = earningsData?.trend || [];

    return {
        isLoading,
        instructor,
        stats,
        earnings,
        chartData,
        availableBalance,
        availableBalanceINR,
        withdrawals,
        withdrawalsData,
        withdrawalsFetching,
        withdrawalPage,
        setWithdrawalPage,
        ITEMS_PER_PAGE,
        refetchWithdrawals,
        bookings,
        courses,
        isOnboarding,
        isWithdrawing,
        isSyncing,
        handleSetupPayouts,
        handleRequestWithdrawal,
        handleRefreshStatus,
        USD_TO_INR
    };
};
