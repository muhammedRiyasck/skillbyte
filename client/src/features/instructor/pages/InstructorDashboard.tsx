import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    ArrowUpRight,
    Play,
    Clock,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import { ROUTES } from '@core/router/paths';
import {
    getDashboardEarnings,
    getDashboardEnrollments,
    getDashboardBookings,
    getInstructorProfile,
    createStripeOnboardingLink,
    getMyWithdrawals,
    requestWithdrawal,
    syncStripeStatus
} from '../services/InstructorDashboardService';
import { toast } from 'sonner';
import Spiner from '@shared/ui/Spiner';
import { getStats } from '../constants/instructorDashboard';
import { useSocket } from '../../../context/SocketContext';
import { useEffect, useState } from 'react';

interface DashboardEarnings {
    id: string;
    studentName: string;
    productName: string;
    instructorAmount: number;
    createdAt: string;
}

interface DashboardCourse {
    id: string;
    courseThumbnail: string;
    courseTitle: string;
    coursePrice: number;
    enrollments: { studentId: string }[];
}

interface DashboardBooking {
    bookingId: string;
    studentId: {
        name: string;
    };
    scheduledAt: string;
}

const InstructorDashboard: React.FC = () => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const { data: earningsData, isLoading: earningsLoading } = useQuery({
        queryKey: ['instructor-dashboard-earnings'],
        queryFn: getDashboardEarnings
    });

    const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
        queryKey: ['instructor-dashboard-enrollments'],
        queryFn: getDashboardEnrollments
    });

    const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
        queryKey: ['instructor-dashboard-bookings'],
        queryFn: getDashboardBookings
    });

    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ['instructor-profile'],
        queryFn: getInstructorProfile
    });

    const [withdrawalPage, setWithdrawalPage] = useState(1);
    const withdrawalLimit = 5;

    const { data: withdrawalsData, isLoading: withdrawalsLoading ,refetch } = useQuery({
        queryKey: ['instructor-withdrawals', withdrawalPage],
        queryFn: () => getMyWithdrawals(withdrawalPage, withdrawalLimit)
    });

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (notification: { title?: string }) => {
            // Refresh data on withdrawal or identity verification notifications
            const shouldRefresh = 
                (notification.title && notification.title.includes('Withdrawal')) ||
                (notification.title && notification.title.includes('Verified'));

            if (shouldRefresh) {
                console.log('Real-time update: Notification received, refreshing dashboard...');
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
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to request withdrawal');
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

    const isLoading = earningsLoading || enrollmentLoading || bookingsLoading || profileLoading || withdrawalsLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-800">
                <Spiner />
            </div>
        );
    }

    const earnings = earningsData?.data?.earnings || [];
    const totalProfit = earningsData?.data?.statistics?.totalProfit || 0;
    const totalStudents = enrollmentData?.data?.totalCount || 0;
    const courses = enrollmentData?.data?.data || [];
    const bookings = bookingsData?.data?.bookings || [];
    const withdrawals = withdrawalsData?.data || [];
    const totalWithdrawals = withdrawalsData?.pagination?.total || 0;
    const totalWithdrawalPages = Math.ceil(totalWithdrawals / withdrawalLimit);

    const instructor = profileData;
    const availableBalance = (instructor?.totalEarnings || 0) - (instructor?.withdrawnAmount || 0);

    const stats = getStats(totalProfit, totalStudents, courses, bookings);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Instructor Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Overview of your teaching performance and schedule</p>
                </div>

                {/* Stripe Payouts Setup Banner */}
                {!instructor?.stripeAccountId && (
                    <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black mb-1">Set up your payouts</h2>
                                <p className="text-blue-100 font-bold max-w-md">To withdraw your earnings to your bank account, you need to complete your Stripe Connect setup.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSetupPayouts}
                            disabled={isOnboarding}
                            className="relative z-10 cursor-pointer bg-white text-blue-600 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                        >
                            {isOnboarding ? 'Preparing...' : 'Complete Setup Now'}
                            {!isOnboarding && <ArrowUpRight className="w-5 h-5" />}
                        </button>

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    </div>
                )}

                {/* Stripe Payouts Incomplete/ID required Banner */}
                {instructor?.stripeAccountId && !instructor?.isStripeVerified && !window.location.search.includes('stripe=success') && (
                    <div className="mb-8 bg-gradient-to-r from-red-600 to-rose-700 rounded-[2rem] p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black mb-1">Action Required: Payouts Disabled</h2>
                                <p className="text-red-100 font-bold max-w-md">Stripe requires more information to verify your identity. Please update your account details to resume payouts.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            <button
                                onClick={handleRefreshStatus}
                                disabled={isSyncing || isOnboarding}
                                className="cursor-pointer bg-white/20 text-white px-8 py-4 rounded-2xl font-black hover:bg-white/30 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2 border border-white/30"
                            >
                                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? 'Refreshing...' : 'Refresh Status'}
                            </button>
                            <button
                                onClick={handleSetupPayouts}
                                disabled={isOnboarding || isSyncing}
                                className="cursor-pointer bg-white text-red-600 px-8 py-4 rounded-2xl font-black hover:bg-red-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
                            >
                                {isOnboarding ? 'Preparing...' : 'Update Account Info'}
                                {!isOnboarding && <ExternalLink className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl"></div>
                    </div>
                )}

                {/* Success Banner if returned from Stripe */}
                {window.location.search.includes('stripe=success') && (
                    <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-4 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="w-6 h-6" />
                        <p className="font-bold">Payout method verified successfully! You can now request withdrawals of your earnings to your bank account.</p>
                    </div>
                )}

                {/* Failed Banner if returned from Stripe */}
                {window.location.search.includes('stripe=failed') && (
                    <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-4 text-red-700 dark:text-red-300">
                        <AlertCircle className="w-6 h-6" />
                        <p className="font-bold">Payout method verification failed. Please try again.</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            to={stat.link}
                            className="bg-white dark:bg-gray-700 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-2xl`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{stat.value}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Earnings Section */}
                    <div className="bg-white dark:bg-gray-700 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Earnings</h2>
                            <Link to={ROUTES.instructor.earnings} className="text-blue-600 font-bold text-sm hover:underline">View All</Link>
                        </div>
                        <div className="p-2 overflow-x-auto">
                            {earnings.length > 0 ? (
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                                        {earnings.map((item: DashboardEarnings) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold uppercase text-xs">
                                                            {item.studentName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.studentName}</p>
                                                            <p className="text-xs text-gray-500">{item.productName}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <p className="font-black text-green-600 dark:text-green-400">${item.instructorAmount}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-20 text-center text-gray-400 font-bold">No recent earnings</div>
                            )}
                        </div>
                    </div>

                    {/* Balance & Withdrawals Section */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2.5rem] p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-teal-100 font-bold uppercase tracking-wider text-sm mb-2">Available to Withdraw (in USD)</p>
                                <h2 className="text-5xl font-black mb-1">${availableBalance.toLocaleString()}</h2>
                                <p className="text-teal-200 text-[10px] font-bold uppercase mb-6 opacity-80">All international earnings are automatically converted to USD for withdrawal.</p>
                                <button
                                    onClick={() => handleRequestWithdrawal(availableBalance)}
                                    disabled={availableBalance < 10 || isWithdrawing || !instructor?.isStripeVerified}
                                    className="bg-white text-teal-600 px-8 py-3 cursor-pointer rounded-2xl font-black hover:bg-teal-50 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                                >
                                    {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
                                </button>
                                {availableBalance < 10 && !(!instructor?.isStripeVerified && instructor?.stripeAccountId) && (
                                    <p className="mt-4 text-teal-50 text-xs font-bold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Minimum withdrawal amount is $10
                                    </p>
                                )}
                                {instructor?.stripeAccountId && !instructor?.isStripeVerified && (
                                    <p className="mt-4 text-red-100 text-xs font-bold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Payouts disabled: Identity verification required
                                    </p>
                                )}
                            </div>
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        <div className="bg-white dark:bg-gray-700 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Withdrawals</h2>
                                {/*  refresh button */}
                                <button
                                    onClick={() => refetch()}
                                    className="bg-white text-teal-600 px-8 py-3 cursor-pointer rounded-2xl font-black hover:bg-teal-50 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-2">
                                {withdrawals.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                                                    {withdrawals.map((w: { _id: string; amount: number; status: string; createdAt: string; adminNotes?: string; payoutMethod: string; payoutDetails: string }) => (
                                                        <tr key={w._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">${w.amount.toLocaleString()}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                                        w.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                                        w.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                        w.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                                        w.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                                                                        w.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                        {w.status}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(w.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                {w.adminNotes && (
                                                                    <p className="text-[10px] text-gray-500 italic mt-1 line-clamp-1" title={w.adminNotes}>
                                                                        Note: {w.adminNotes}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{w.payoutMethod}</p>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {totalWithdrawals > withdrawalLimit && (
                                            <div className="p-4 border-t border-gray-100 dark:border-gray-600 flex items-center justify-between">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                    Showing {withdrawalPage*withdrawalLimit-(withdrawalLimit-withdrawals.length)} of {totalWithdrawals}
                                                </p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setWithdrawalPage(p => Math.max(1, p - 1))}
                                                        disabled={withdrawalPage === 1}
                                                        className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => setWithdrawalPage(p => Math.min(totalWithdrawalPages, p + 1))}
                                                        disabled={withdrawalPage === totalWithdrawalPages}
                                                        className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 cursor-pointer"
                                                    >
                                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-12 text-center text-gray-400 font-bold text-sm">No withdrawals yet</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Bookings Section */}
                    <div className="bg-white dark:bg-gray-700 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden lg:col-span-2">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-600 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Upcoming Sessions</h2>
                            <Link to={ROUTES.instructor.mentorship.bookings} className="text-blue-600 font-bold text-sm hover:underline">View All</Link>
                        </div>
                        <div className="p-6">
                            {bookings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {bookings.map((booking: DashboardBooking) => (
                                        <div key={booking.bookingId} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl text-teal-600">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{booking.studentId.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(booking.scheduledAt).toLocaleDateString()} • {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                to={ROUTES.instructor.mentorship.bookings}
                                                className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-gray-400 font-bold">No sessions scheduled</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enrolled Courses Section */}
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Enrolled Courses</h2>
                        <Link to={ROUTES.instructor.myCourses} className="text-blue-600 font-bold hover:underline flex items-center gap-2">
                            Browse All <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.slice(0, 3).map((course: DashboardCourse) => (
                            <div key={course.id} className="bg-white dark:bg-gray-700 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-600 group">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={course.courseThumbnail}
                                        alt={course.courseTitle}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-gray-900 dark:text-gray-100">
                                        {course.enrollments.length} Students
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 line-clamp-1">{course.courseTitle}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">${course.coursePrice}</span>
                                        <Link
                                            to={ROUTES.instructor.myCourses}
                                            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all"
                                        >
                                            Manage <Play className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {courses.length === 0 && (
                            <div className="col-span-full py-20 bg-white dark:bg-gray-700 rounded-[3rem] border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center">
                                <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
                                <p className="text-gray-400 font-bold text-lg">No Enrolled Courses</p>
                                <Link to={ROUTES.instructor.myCourses} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                                    Manage Courses
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
