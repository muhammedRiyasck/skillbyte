import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
    Users, 
    BookOpen, 
    DollarSign, 
    TrendingUp, 
    ArrowUpRight, 
    Calendar,
    Clock,
    UserPlus,
    PieChart as PieChartIcon,
    Activity,
    ChevronRight,
    Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { ROUTES } from '@/core/router/paths';
import { getAdminDashboardData } from '../services/DashboardService';
import Spiner from '@shared/ui/Spiner';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface AdminDashboardData {
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

const AdminDashboard: React.FC = () => {
    const { data: dashboardResponse, isLoading } = useQuery<{ data: AdminDashboardData }>({
        queryKey: ['admin-dashboard-data'],
        queryFn: getAdminDashboardData
    });

    const Pulse = () => (
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
    );

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
                    <motion.div
                        key={stat.label}
                        variants={itemVariants}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group transition-all"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-2xl`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <Pulse />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-[10px] text-slate-500 font-bold">{stat.description}</p>
                        </div>
                        <Link to={stat.link} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                        </Link>
                        <div className={`absolute -bottom-6 -right-6 w-20 h-20 ${stat.bgColor} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
                    </motion.div>
                ))}
            </div>

            {/* Main Charts & Actions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend - 2/3 Width */}
                <motion.div 
                    variants={itemVariants}
                    className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Revenue Analysis</h3>
                            <p className="text-sm text-slate-500 font-medium">Platform growth and commission trend</p>
                        </div>
                        <div className="flex gap-2">
                             <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                Live Status
                             </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.revenueTrend || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                                    tickFormatter={(v) => `$${v}`}
                                />
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-2 dark:border-slate-700">{payload[0].payload.date}</p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between gap-8">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                                                <span className="text-xs font-bold text-slate-500">Revenue</span>
                                                            </div>
                                                            <span className="text-sm font-black text-slate-900 dark:text-white">${payload[0].value}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-8">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                                <span className="text-xs font-bold text-slate-500">Commission</span>
                                                            </div>
                                                            <span className="text-sm font-black text-emerald-600">${payload[1].value}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#6366f1" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorRev)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="commission" 
                                    stroke="#10b981" 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorComm)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

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
                                    <p className="font-black text-slate-900 dark:text-slate-200">Instructor Apps</p>
                                    <p className="text-xs text-amber-600 font-bold">{data?.pendingActions?.instructorApplications || 0} waiting</p>
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
                                    <p className="text-xs text-rose-600 font-bold">{data?.pendingActions?.pendingWithdrawals || 0} pending</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-rose-300 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link to={ROUTES.admin.courseManagement} className="flex items-center justify-between p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 group hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-600">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 dark:text-slate-200">Course Reviews</p>
                                    <p className="text-xs text-indigo-600 font-bold">{data?.pendingActions?.coursesAwaitingReview || 0} in queue</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
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
                                        data={data?.categoryDistribution || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="category"
                                    >
                                        {(data?.categoryDistribution || []).map((_, index: number) => (
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
                            {(data?.categoryDistribution || []).slice(0, 6).map((item, idx: number) => (
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
                <motion.div 
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Platform Health</h3>
                            <p className="text-sm text-slate-500 font-medium">Quality and performance indices</p>
                        </div>
                        <Activity className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 text-center">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Avg Progress</p>
                            <h4 className="text-3xl font-black text-indigo-600 mb-2">{Math.round(data?.platformHealth?.avgCompletionRate || 0)}%</h4>
                            <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-1.5">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${data?.platformHealth?.avgCompletionRate || 0}%` }}></div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-center">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Instructor Rating</p>
                            <h4 className="text-3xl font-black text-emerald-600 mb-2">{data?.platformHealth?.avgInstructorRating?.toFixed(1) || '0.0'}</h4>
                            <div className="flex justify-center items-center gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 ${i < Math.round(data?.platformHealth?.avgInstructorRating || 0) ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Mentorship Yield</p>
                            <h4 className="text-3xl font-black text-blue-600 mb-2">{Math.round(data?.platformHealth?.mentorshipCompletionRate || 0)}%</h4>
                            <p className="text-[10px] font-bold text-slate-500">Scheduled vs Completed</p>
                        </div>
                    </div>

                    <div className="mt-8 p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-200">Growth Projection</h4>
                            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12% MoM</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">Platform engagement is tracking above quarterly targets. High mentorship completion rates suggest strong user retention potential.</p>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Instructors */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                >
                    <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Top Instructors</h2>
                            <p className="text-xs text-slate-500 font-medium">Leading revenue generation</p>
                        </div>
                        <Link to={ROUTES.admin.instructorManagement} className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm hover:shadow-md transition-all group">
                            <Search className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                        </Link>
                    </div>
                    <div className="p-4 space-y-3">
                        {data?.topInstructors && data.topInstructors.length > 0 ? (
                            data.topInstructors.map((inst) => (
                                <div key={inst._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg border border-indigo-100 dark:border-indigo-500/20 overflow-hidden">
                                            {inst.profilePictureUrl ? <img src={inst.profilePictureUrl} alt="" className="w-full h-full object-cover" /> : inst.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{inst.name}</p>
                                            <div className="flex items-center gap-1 text-amber-400">
                                                <TrendingUp className="w-3 h-3" />
                                                <span className="text-[10px] font-bold text-slate-500 ">{inst.averageRating?.toFixed(1) || '0.0'} rating</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg">${inst.totalEarnings?.toLocaleString() || 0}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Earnings</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-slate-500">No leading instructors identified yet.</div>
                        )}
                    </div>
                </motion.div>

                {/* Recent Payments */}
                <motion.div 
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden"
                >
                    <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <Pulse />
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Recent Payments</h2>
                                <p className="text-xs text-slate-500 font-medium">Latest incoming transactions</p>
                            </div>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm">
                            <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                    <div className="p-4 space-y-3">
                        {data?.recentPayments && data.recentPayments.length > 0 ? (
                            data.recentPayments.map((p) => (
                                <div key={p._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/30 dark:bg-slate-900/20 border border-slate-100/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600 border border-emerald-100 dark:border-emerald-500/20">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-slate-100">{p.productName}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.studentName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white text-base">
                                            {p.currency?.toUpperCase() === 'INR' ? '₹' : '$'}{p.amount.toLocaleString()}
                                        </p>
                                        {p.currency?.toUpperCase() === 'INR' && (
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                                ≈ ${(p.amount / 83).toFixed(2)} USD
                                            </p>
                                        )}
                                        <p className="text-[10px] text-emerald-600 font-black uppercase">
                                            Fee: {p.currency?.toUpperCase() === 'INR' ? '₹' : '$'}{p.adminFee.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-slate-500 font-bold flex flex-col items-center">
                                <DollarSign className="w-12 h-12 mb-2 opacity-10" />
                                No payments recorded yet
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
