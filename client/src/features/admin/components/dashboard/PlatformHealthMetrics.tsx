import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Activity, TrendingUp, Star, Users } from 'lucide-react';

interface Props {
    health: {
        avgCompletionRate: number;
        avgInstructorRating: number;
        mentorshipCompletionRate: number;
    } | undefined;
    itemVariants?: Variants;
}

const metrics = [
    {
        key: 'avgCompletionRate' as const,
        label: 'Avg Course Progress',
        icon: TrendingUp,
        color: 'indigo',
        unit: '%',
        description: 'Average student progress across all enrollments',
        format: (v: number) => `${Math.round(v)}%`,
        showBar: true,
    },
    {
        key: 'avgInstructorRating' as const,
        label: 'Instructor Rating',
        icon: Star,
        color: 'emerald',
        unit: '/5',
        description: 'Average rating across approved instructors',
        format: (v: number) => v.toFixed(1),
        showStars: true,
    },
    {
        key: 'mentorshipCompletionRate' as const,
        label: 'Mentorship Rate',
        icon: Users,
        color: 'blue',
        unit: '%',
        description: 'Scheduled mentorship sessions completed',
        format: (v: number) => `${Math.round(v)}%`,
        showBar: true,
    },
] as const;

const colorMap: Record<string, { bg: string; border: string; text: string; bar: string; barBg: string }> = {
    indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/10',
        border: 'border-indigo-100 dark:border-indigo-900/30',
        text: 'text-indigo-600',
        bar: 'bg-indigo-500',
        barBg: 'bg-indigo-200 dark:bg-indigo-800',
    },
    emerald: {
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        border: 'border-emerald-100 dark:border-emerald-900/30',
        text: 'text-emerald-600',
        bar: 'bg-emerald-500',
        barBg: 'bg-emerald-200 dark:bg-emerald-800',
    },
    blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        border: 'border-blue-100 dark:border-blue-900/30',
        text: 'text-blue-600',
        bar: 'bg-blue-500',
        barBg: 'bg-blue-200 dark:bg-blue-800',
    },
};

const PlatformHealthMetrics: React.FC<Props> = ({ health, itemVariants }) => {
    const allZero = !health ||
        (health.avgCompletionRate === 0 &&
         health.avgInstructorRating === 0 &&
         health.mentorshipCompletionRate === 0);

    return (
        <motion.div
            {...(itemVariants && { variants: itemVariants })}
            className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Platform Health</h3>
                    <p className="text-sm text-slate-500 font-medium">Quality and performance indices</p>
                </div>
                <Activity className="w-6 h-6 text-emerald-500" />
            </div>

            {allZero ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <Activity className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No health data yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Metrics will appear once students enroll and instructors are rated</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5">
                    {metrics.map((metric) => {
                        const value = health?.[metric.key] || 0;
                        const c = colorMap[metric.color];
                        const Icon = metric.icon;
                        return (
                            <div key={metric.key} className={`p-5 rounded-3xl ${c.bg} border ${c.border}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${c.text}`} />
                                        <p className={`text-xs font-black uppercase tracking-widest ${c.text}`}>{metric.label}</p>
                                    </div>
                                    <span className={`text-lg font-black ${c.text}`}>{metric.format(value)}</span>
                                </div>
                                {'showBar' in metric && metric.showBar && (
                                    <div className={`w-full ${c.barBg} rounded-full h-1.5`}>
                                        <div
                                            className={`${c.bar} h-1.5 rounded-full transition-all duration-700`}
                                            style={{ width: `${Math.min(value, 100)}%` }}
                                        />
                                    </div>
                                )}
                                {'showStars' in metric && metric.showStars && (
                                    <div className="flex items-center gap-1 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                className={`w-3 h-3 ${i < Math.round(value) ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`}
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                        ))}
                                        <span className="text-[10px] font-bold text-slate-400 ml-1">{metric.format(value)} out of 5</span>
                                    </div>
                                )}
                                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-2">{metric.description}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default PlatformHealthMetrics;
