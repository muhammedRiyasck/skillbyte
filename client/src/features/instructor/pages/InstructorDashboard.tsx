import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    ArrowUpRight,
    Play,
    Clock,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    Plus,
    TrendingUp,
    DollarSign,
    Users,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Star
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
import { motion } from 'framer-motion';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';

// Matches PaymentResponseDto from server
interface DashboardEarnings {
    id: string;
    productName: string;
    amount: number;
    currency: string;
    createdAt?: string | Date;
}

// Matches CourseEnrollmentSummaryDto from server
interface DashboardCourse {
    id: string;
    courseThumbnail?: string;
    courseTitle: string;
    coursePrice: number;
    enrollments: { studentId: string; studentName: string; studentEmail: string; enrollmentDate: Date; status: string; progress: number }[];
}

// Matches BookingResponseDto from server
interface DashboardBooking {
    bookingId: string;
    studentId: string;
    scheduledAt: string | Date;
    status: string;
    amount: number;
    currency: string;
}

// Matches WithdrawalResponseDto from server
interface WithdrawalItem {
    withdrawalId: string;
    amount: number;
    status: string;
    currency: string;
    createdAt?: string | Date;
}

interface DashboardStat {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    link: string;
    subValue?: string;
}

const InstructorDashboard: React.FC = () => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const [withdrawalPage, setWithdrawalPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Backend: { data: PaymentResponseDto[]; totalCount; totalRevenue; totalProfit }
    const { data: earningsData } = useQuery<{ data: DashboardEarnings[]; totalCount: number; totalRevenue: number; totalProfit: number }>({
        queryKey: ['instructor-dashboard-earnings'],
        queryFn: () => getDashboardEarnings()
    });

    // Backend: { data: CourseEnrollmentSummaryDto[]; totalCount }
    const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery<{ data: DashboardCourse[]; totalCount: number }>({
        queryKey: ['instructor-dashboard-enrollments'],
        queryFn: getDashboardEnrollments
    });

    // Backend: { bookings: BookingResponseDto[] } (wrapped in ApiResponse.data)
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery<{ bookings: DashboardBooking[] }>({
        queryKey: ['instructor-dashboard-bookings'],
        queryFn: getDashboardBookings
    });

    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ['instructor-profile'],
        queryFn: getInstructorProfile
    });

    // Backend: { data: WithdrawalResponseDto[]; pagination: { total, page, limit } }
    const { data: withdrawalsData, isFetching: withdrawalsFetching, refetch } = useQuery<{ data: WithdrawalItem[]; pagination: { total: number; page: number; limit: number } }>({
        queryKey: ['instructor-withdrawals', withdrawalPage],
        queryFn: () => getMyWithdrawals(withdrawalPage, ITEMS_PER_PAGE),
        placeholderData: keepPreviousData
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
            refetch();
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

    const isInitialLoading = profileLoading || enrollmentLoading || bookingsLoading;
    const isLoading = isInitialLoading && !profileData; // Only show global spinner if core data is missing

    const earnings = useMemo(() => {
        const raw = earningsData?.data;
        return Array.isArray(raw) ? raw : [];
    }, [earningsData]);
    const totalProfit = earningsData?.totalProfit || 0;
    const totalStudents = enrollmentData?.totalCount || 0;
    const courses = enrollmentData?.data || [];
    const bookings = bookingsData?.bookings || [];
    const withdrawals = withdrawalsData?.data || [];

    const instructor = profileData;
    const availableBalance = (instructor?.totalEarnings || 0) - (instructor?.withdrawnAmount || 0);
    const USD_TO_INR = 83;
    const availableBalanceINR = Math.round(availableBalance * USD_TO_INR);

    const stats = getStats(totalProfit, totalStudents, courses, bookings);

    const chartData = useMemo(() => {
        if (!Array.isArray(earnings) || earnings.length === 0) return [];
        const grouped = earnings.reduce((acc: Record<string, number>, curr: DashboardEarnings) => {
            const date = new Date(curr.createdAt ?? '').toLocaleDateString();
            // Backend always returns amount in the payment currency (USD or INR)
            const amountInUSD = curr.currency === 'INR'
                ? curr.amount / USD_TO_INR
                : curr.amount;
            acc[date] = (acc[date] || 0) + amountInUSD;
            return acc;
        }, {});
        return Object.entries(grouped)
            .map(([date, amount]) => ({ date, amount: amount as number }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-7);
    }, [earnings]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-800">
                <Spiner />
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-4 md:p-8"
        >
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <motion.h1 
                            variants={itemVariants}
                            className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2"
                        >
                            Instructor <span className="text-indigo-600 dark:text-indigo-400">Dashboard</span>
                        </motion.h1>
                        <motion.p 
                            variants={itemVariants}
                            className="text-slate-500 dark:text-slate-400 font-medium"
                        >
                            Monitor your performance, earnings, and schedules in real-time.
                        </motion.p>
                    </div>
                    <motion.div variants={itemVariants}>
                        <Link 
                            to={ROUTES.instructor.createCourseBase}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 group"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Create New Course
                        </Link>
                    </motion.div>
                </header>

                {/* Stripe Banners */}
                {!instructor?.stripeAccountId && (
                    <motion.div 
                        variants={itemVariants}
                        className="mb-10 bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden"
                    >
                        <div className="bg-white/5 backdrop-blur-md rounded-[2.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative">
                            <div className="relative z-10 flex items-center gap-8">
                                <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-xl border border-white/30 shadow-inner">
                                    <AlertCircle className="w-10 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black tracking-tight">Enable Professional Payouts</h2>
                                    <p className="text-blue-50 font-medium max-w-lg leading-relaxed">Join our elite instructors! Link your bank account via Stripe Connect to receive automatic earnings directly into your account.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSetupPayouts}
                                disabled={isOnboarding}
                                className="relative z-10 cursor-pointer bg-white text-indigo-600 px-10 py-5 rounded-[1.5rem] font-black hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-3 text-lg"
                            >
                                {isOnboarding ? 'Initializing...' : 'Set Up Payouts Now'}
                                {!isOnboarding && <ArrowUpRight className="w-6 h-6" />}
                            </button>
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] -ml-32 -mb-32"></div>
                        </div>
                    </motion.div>
                )}

                {instructor?.stripeAccountId && !instructor?.isStripeVerified && !window.location.search.includes('stripe=success') && (
                    <motion.div 
                        variants={itemVariants}
                        className="mb-10 bg-gradient-to-br from-rose-600 to-pink-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/20"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-8">
                                <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-xl border border-white/30 shadow-lg">
                                    <AlertCircle className="w-10 h-10 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight mb-2">Verification Required</h2>
                                    <p className="text-rose-50 font-medium max-w-md leading-relaxed">Stripe needs additional documentation to verify your identity. Payouts are temporarily paused until completion.</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleRefreshStatus}
                                    disabled={isSyncing || isOnboarding}
                                    className="cursor-pointer bg-white/10 text-white backdrop-blur-md px-8 py-4 rounded-[1.2rem] font-black hover:bg-white/20 transition-all border border-white/30 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                                    {isSyncing ? 'Syncing...' : 'Sync Status'}
                                </button>
                                <button
                                    onClick={handleSetupPayouts}
                                    disabled={isOnboarding || isSyncing}
                                    className="cursor-pointer bg-white text-rose-600 px-8 py-4 rounded-[1.2rem] font-black hover:bg-rose-50 transition-all shadow-xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
                                >
                                    {isOnboarding ? 'Loading...' : 'Complete Verification'}
                                    {!isOnboarding && <ExternalLink className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
                    </motion.div>
                )}

                {window.location.search.includes('stripe=success') && (
                    <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-4 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="w-6 h-6" />
                        <p className="font-bold">Payout method verified successfully! You can now request withdrawals of your earnings to your bank account.</p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <Link
                                to={stat.link}
                                className="block h-full bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden group"
                            >
                                <div className="relative z-10 flex items-start justify-between">
                                    <div className={`${stat.bgColor} ${stat.color} p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="w-7 h-7" />
                                    </div>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                                        <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                </div>
                                <div className="mt-6 relative z-10">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                                        {(stat as DashboardStat).subValue && (
                                            <p className="text-sm font-bold text-slate-400">{ (stat as DashboardStat).subValue }</p>
                                        )}
                                    </div>
                                </div>
                                <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${stat.bgColor} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Main Data Content Area - Stacked Layout */}
                <div className="flex flex-col gap-10 mb-10">
                    {/* Earnings Trend Chart - Full Width */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700/50"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Earnings Overview</h3>
                                <p className="text-sm text-slate-500 font-medium">Daily income distribution for this week</p>
                            </div>
                            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                                <TrendingUp className="w-4 h-4" />
                                Moving Up
                            </div>
                        </div>
                        
                        <div className="h-[400px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                            tickFormatter={(val) => `$${val}`}
                                        />
                                        <Tooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const val = payload[0].value as number;
                                                    return (
                                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.date}</p>
                                                            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">${val.toLocaleString()}</p>
                                                            <p className="text-xs font-bold text-slate-500">≈ ₹{Math.round(val * USD_TO_INR).toLocaleString()}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="amount" 
                                            stroke="#6366f1" 
                                            strokeWidth={4} 
                                            fillOpacity={1} 
                                            fill="url(#colorAmount)" 
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold">
                                    <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                                    No chart data available yet
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Profile / Balance Card - Full Width Below Chart */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]"
                    >
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl border border-white/30">
                                        {instructor?.profilePicture ? <img className="w-full h-full rounded-2xl" src={instructor?.profilePicture} alt="" /> : <span className="text-2xl">{instructor?.name?.charAt(0) || 'I'}</span>}
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Instructor Account</p>
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-xl font-black">{instructor?.name}</h4>
                                          {instructor?.averageRating !== undefined && instructor.totalReviews !== undefined && (
                                              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 mt-0.5">
                                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                  <span className="text-xs font-bold text-white">{instructor.averageRating.toFixed(1)}</span>
                                                  <span className="text-[10px] text-white/70">({instructor.totalReviews})</span>
                                              </div>
                                          )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                  <div className="flex flex-col">
                                   <p className="text-indigo-100/60 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Available Balance</p>
                                   <h2 className="text-6xl font-black mb-1 flex items-baseline gap-2">
                                    <span className="text-2xl opacity-50">$</span>
                                    {availableBalance.toLocaleString()}
                                   </h2>
                                   <p className="text-indigo-100 text-sm font-bold opacity-80 mb-6">≈ ₹{availableBalanceINR.toLocaleString()}</p>
                                  </div>
                                   <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">Verified Partner
                                   {/* offical blue tick mark svg */}
                                   <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                   </svg>
                                  </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col md:flex-row gap-4 my-6">
                                    <button
                                        onClick={() => handleRequestWithdrawal(availableBalance)}
                                        disabled={availableBalance < 10 || isWithdrawing || !instructor?.isStripeVerified}
                                        className="flex-1 bg-white text-indigo-700 py-4 rounded-2xl cursor-pointer font-black hover:bg-slate-50 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-lg"
                                    >
                                        {isWithdrawing ? 'Processing...' : 'Request Payout'}
                                    </button>
                                   
                                </div>
                                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                                    {availableBalance < 10 && (
                                        <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Min $10 Needed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/20 rounded-full blur-[80px] -ml-36 -mb-36"></div>
                    </motion.div>
                </div>

                {/* Activity History Grid - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Recent Earnings Section */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Recent Earnings</h2>
                                <p className="text-xs text-slate-500 font-medium mt-1">Latest student enrollments</p>
                            </div>
                            <Link 
                                to={ROUTES.instructor.earnings} 
                                className="bg-white dark:bg-slate-700 p-2 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm hover:shadow-md transition-all group"
                            >
                                <ArrowUpRight className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>
                        <div className="p-4 space-y-3">
                            {earnings.length > 0 ? (
                                earnings.slice(0, 5).map((item: DashboardEarnings) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg border border-indigo-100 dark:border-indigo-500/20">
                                                {item.productName?.charAt(0) || '$'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.productName || 'Unknown Product'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {item.currency === 'INR' ? (
                                                <>
                                                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg">₹{item.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        ≈ ${(item.amount / USD_TO_INR).toFixed(2)}
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg">${item.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                        ≈ ₹{Math.round(item.amount * USD_TO_INR).toLocaleString()}
                                                    </p>
                                                </>
                                            )}
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.05em] mt-1">{new Date(item.createdAt ?? '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-slate-400 font-bold flex flex-col items-center">
                                    <DollarSign className="w-12 h-12 mb-2 opacity-10" />
                                    No earnings reports
                                </div>
                            )}
                        </div>
                        
                    </motion.div>

                    {/* Recent Withdrawals Section */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Withdrawals</h2>
                                <p className="text-xs text-slate-500 font-medium mt-1">Payout history status</p>
                            </div>
                            <button
                                onClick={() => refetch()}
                                className="bg-white dark:bg-slate-700 p-2 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm hover:shadow-md transition-all group"
                            >
                                <RefreshCw className={`w-5 h-5 text-indigo-600 group-hover:rotate-180 transition-transform duration-500 ${isSyncing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="relative min-h-[400px]">
                            {/* Local Loading Overlay */}
                            {withdrawalsFetching && (
                                <div className="absolute inset-0 z-10 bg-white/40 dark:bg-slate-800/40 backdrop-blur-[1px] flex items-center justify-center">
                                    <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-600">
                                        <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                                    </div>
                                </div>
                            )}
                            
                            <div className="p-4 space-y-3">
                                {withdrawals.length > 0 ? (
                                    withdrawals.slice(0, 5).map((w: WithdrawalItem) => (
                                        <div key={w.withdrawalId} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 font-black border border-slate-200 dark:border-slate-600">
                                                    <ExternalLink className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white">${w.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">≈ ₹{Math.round(w.amount * USD_TO_INR).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                                                    w.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                                    w.status === 'REJECTED' || w.status === 'FAILED' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                                                    'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                }`}>
                                                    {w.status}
                                                </span>
                                                <p className="text-[10px] text-slate-400 font-bold">{w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center text-slate-400 font-bold flex flex-col items-center">
                                        <Clock className="w-12 h-12 mb-2 opacity-10" />
                                        No payouts recorded
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Pagination Controls */}
                        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Page {withdrawalPage}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setWithdrawalPage(p => Math.max(1, p - 1))}
                                    disabled={withdrawalPage === 1}
                                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:cursor-not-allowed cursor-pointer disabled:opacity-30 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button 
                                    onClick={() => setWithdrawalPage(p => p + 1)}
                                    disabled={!withdrawalsData?.data || withdrawalsData.data.length < ITEMS_PER_PAGE}
                                    className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:cursor-not-allowed cursor-pointer disabled:opacity-30 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Upcoming Sessions */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden mb-10"
                >
                    <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Upcoming Sessions</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">Your mentorship schedule</p>
                        </div>
                        <Link to={ROUTES.instructor.mentorship.bookings} className="text-indigo-600 font-black text-sm hover:underline">Full Schedule</Link>
                    </div>
                    <div className="p-8">
                        {bookings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bookings.slice(0, 3).map((booking: DashboardBooking) => (
                                    <div key={booking.bookingId} className="group relative bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-500/30 transition-all hover:shadow-2xl hover:shadow-indigo-500/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-700">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white">{typeof booking.studentId === 'string' ? `Student #${booking.studentId.slice(-6)}` : 'Student'}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Session Student</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                <Calendar className="w-4 h-4 text-indigo-500" />
                                                {new Date(booking.scheduledAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                                <Clock className="w-4 h-4 text-indigo-500" />
                                                {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <Link
                                            to={ROUTES.instructor.mentorship.bookings}
                                            className="block w-full text-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 py-3 rounded-2xl font-black text-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                                        >
                                            Launch Session
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400 font-bold flex flex-col items-center">
                                <Calendar className="w-12 h-12 mb-4 opacity-10" />
                                <p>No Upcoming Sessions</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Enrolled Courses */}
                <div className="mb-10">
                    <motion.div 
                        variants={itemVariants}
                        className="flex justify-between items-center mb-8"
                    >
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center">Your Courses</h2>
                            <p className="text-slate-500 font-medium mt-1">Manage and track your educational content</p>
                        </div>
                        <Link to={ROUTES.instructor.myCourses} className="group flex items-center gap-2 text-sm font-black text-indigo-600 hover:gap-3 transition-all">
                            View All Assets <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.length > 0 ? (
                            courses.slice(0, 3).map((course: DashboardCourse) => (
                                <motion.div
                                    key={course.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -10 }}
                                    className="bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/50 group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all"
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        <img
                                            src={course.courseThumbnail}
                                            alt={course.courseTitle}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-slate-900 dark:text-white border border-white/20 shadow-xl flex items-center gap-2">
                                            <Users className="w-3 h-3 text-indigo-600" />
                                            {course.enrollments.length} Students
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-6">
                                            <span className="text-white font-black text-xl tracking-tight">₹ {course.coursePrice}</span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <h3 className="font-black text-xl text-slate-900 dark:text-white mb-6 line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tighter">{course.courseTitle}</h3>
                                        <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-700/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                                            </div>
                                            <Link
                                                to={ROUTES.instructor.myCourses}
                                                className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-slate-900 transition-all"
                                            >
                                                <Play className="w-4 h-4 ml-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                variants={itemVariants}
                                className="col-span-full py-24 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center"
                            >
                                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full mb-6">
                                    <BookOpen className="w-16 h-16 text-slate-200" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Build Your First Curriculum</h3>
                                <p className="text-slate-500 font-medium max-w-xs mb-8">Ready to share your knowledge? Create your first course and reach thousands of students.</p>
                                <Link 
                                    to={ROUTES.instructor.createCourseBase} 
                                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none"
                                >
                                    Get Started
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default InstructorDashboard;
