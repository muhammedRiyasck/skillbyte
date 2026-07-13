import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { DashboardStat } from '../../hooks/useInstructorDashboard';

interface DashboardStatsProps {
    itemVariants: Variants;
    stats: DashboardStat[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ itemVariants, stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat) => (
                <motion.div
                    key={stat.label}
                    variants={itemVariants}
                    whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
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
                                {stat.subValue && (
                                    <p className="text-sm font-bold text-slate-400">{stat.subValue}</p>
                                )}
                            </div>
                        </div>
                        <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${stat.bgColor} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
};

export default DashboardStats;
