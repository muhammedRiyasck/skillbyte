import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Users, 
    BookOpen, 
    DollarSign, 
    TrendingUp, 
    Calendar,
    Clock,
    UserPlus,
    PieChart as PieChartIcon,
    ChevronRight,
    AlertTriangle,
    ShieldX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip
} from 'recharts';
import { ROUTES } from '@/core/router/paths';
import { getAdminDashboardData } from '../services/DashboardService';
import Spiner from '@shared/ui/Spiner';
import type { AdminDashboardData } from '../types/IDashboard';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import RevenueTrendChart from '../components/dashboard/RevenueTrendChart';
import PlatformHealthMetrics from '../components/dashboard/PlatformHealthMetrics';
import TopInstructorsList from '../components/dashboard/TopInstructorsList';
import RecentPaymentsList from '../components/dashboard/RecentPaymentsList';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard: React.FC = () => {
    const { data: dashboardResponse, isLoading } = useQuery<{ data: AdminDashboardData }>({
        queryKey: ['admin-dashboard-data'],
        queryFn: getAdminDashboardData
    });

    const data = dashboardResponse?.data;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    // Process category distribution: Top 5 + Others
    const processedCategoryData = React.useMemo(() => {
        const rawCategories = data?.categoryDistribution || [];
        if (rawCategories.length <= 6) return rawCategories;
        const top5 = rawCategories.slice(0, 5);
        const othersCount = rawCategories.slice(5).reduce((sum, item) => sum + item.count, 0);
        return [...top5, { category: 'Others', count: othersCount }];
    }, [data?.categoryDistribution]);

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Spiner />
            </div>
        );
    }

    const statsCards = [
        {
            label: 'Total Revenue (USD)',
            value: `$${data?.stats?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
            icon: DollarSign,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
            link: ROUTES.admin.withdrawalManagement,
            description: 'Normalized platform volume'
        },
        {
            label: 'Admin Commission (USD)',
            value: `$${data?.stats?.adminCommission?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            link: ROUTES.admin.withdrawalManagement,
            description: 'Platform net commission'
        },
        {
            label: 'Total Students',
            value: data?.stats?.totalStudents || 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            link: ROUTES.admin.studentManagement,
            description: `${data?.stats?.activeStudents || 0} active accounts`
        },
        {
            label: 'Total Instructors',
            value: data?.stats?.totalInstructors || 0,
            icon: UserPlus,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            link: ROUTES.admin.instructorManagement,
            description: `${data?.stats?.pendingInstructors || 0} pending review`
        },
        {
            label: 'Total Courses',
            value: data?.stats?.totalCourses || 0,
            icon: BookOpen,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            link: ROUTES.admin.courseManagement,
            description: `${data?.stats?.publishedCourses || 0} published`
        },
        {
            label: 'Pending Payouts',
            value: data?.stats?.pendingWithdrawals || 0,
            icon: Clock,
            color: 'text-rose-600',
            bgColor: 'bg-rose-100 dark:bg-rose-900/30',
            link: ROUTES.admin.withdrawalManagement,
            description: `$${data?.stats?.pendingWithdrawalAmount || 0} total requested`
        }
    ];

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-4 md:p-8 space-y-8 bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen"
        >
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Platform <span className="text-indigo-600 dark:text-indigo-400">Overview</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Control center for all platform operations and growth metrics.</p>
                </div>
                <div className="flex gap-3">
                   <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                     <Calendar className="w-5 h-5 text-indigo-500" />
                     <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                   </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statsCards.map((stat) => (
                    <DashboardStatCard key={stat.label} stat={stat} itemVariants={itemVariants} />
                ))}
            </div>

            {/* Main Charts & Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend - 2/3 Width */}
                <RevenueTrendChart data={data?.revenueTrend} itemVariants={itemVariants} />

                {/* Pending Actions - 1/3 Width */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col"
                >
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Pending Actions</h3>
                        <p className="text-sm text-slate-500 font-medium">Critical items requiring your attention</p>
                    </div>
                    <div className="space-y-4 flex-1">
                        <Link to={ROUTES.admin.instructorManagement} className="flex items-center justify-between p-5 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-amber-600">
                                    <UserPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-slate-200">Instructor Applications</p>
                                    {(data?.pendingActions?.instructorApplications || 0) > 0 ? (
                                        <p className="text-xs text-amber-600 font-bold">{data?.pendingActions?.instructorApplications} waiting</p>
                                    ) : (
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">All clear</p>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-amber-300 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link to={ROUTES.admin.withdrawalManagement} className="flex items-center justify-between p-5 rounded-3xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-rose-600">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-slate-200">Payout Requests</p>
                                    {(data?.pendingActions?.pendingWithdrawals || 0) > 0 ? (
                                        <p className="text-xs text-rose-600 font-bold">{data?.pendingActions?.pendingWithdrawals} pending</p>
                                    ) : (
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">All clear</p>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link to={`${ROUTES.admin.courseManagement}?status=${encodeURIComponent('Blocked Courses')}`} className="flex items-center justify-between p-5 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-red-600">
                                    <ShieldX className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-slate-200">Blocked Courses</p>
                                    {(data?.stats?.blockedCourses || 0) > 0 ? (
                                        <p className="text-xs text-red-600 font-bold">{data?.stats?.blockedCourses} blocked</p>
                                    ) : (
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">All clear</p>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-red-300 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link to={ROUTES.admin.reportedContent} className="flex items-center justify-between p-5 rounded-3xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-orange-600">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-slate-200">Content Moderation</p>
                                    {(data?.pendingActions?.pendingReports || 0) > 0 ? (
                                        <p className="text-xs text-orange-600 font-bold">{data?.pendingActions?.pendingReports} reports pending</p>
                                    ) : (
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">All clear</p>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-orange-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Third Row: Distribution & Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Pie Chart */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Course Categories</h3>
                            <p className="text-sm text-slate-500 font-medium">Distribution across disciplines</p>
                        </div>
                        <PieChartIcon className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-center">
                        <div className="w-full md:w-1/2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={processedCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="category"
                                    >
                                        {processedCategoryData.map((_, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 grid grid-cols-1 gap-2 p-4">
                            {processedCategoryData.map((item, idx: number) => (
                                <div key={item.category} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 capitalize">{item.category}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Platform Health Metrics */}
                <PlatformHealthMetrics health={data?.platformHealth} itemVariants={itemVariants} />
            </div>

            {/* Bottom Row Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Instructors */}
                <TopInstructorsList instructors={data?.topInstructors} itemVariants={itemVariants} />

                {/* Recent Payments */}
                <RecentPaymentsList payments={data?.recentPayments} itemVariants={itemVariants} />
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
