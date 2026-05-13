import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Activity, TrendingUp } from 'lucide-react';

interface Props {
    health: {
        avgCompletionRate: number;
        avgInstructorRating: number;
        mentorshipCompletionRate: number;
    } | undefined;
    itemVariants?: Variants;
}

const PlatformHealthMetrics: React.FC<Props> = ({ health, itemVariants }) => {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 text-center">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Avg Progress</p>
                    <h4 className="text-3xl font-black text-indigo-600 mb-2">{Math.round(health?.avgCompletionRate || 0)}%</h4>
                    <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-1.5">
                        <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${health?.avgCompletionRate || 0}%` }}></div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-center">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Instructor Rating</p>
                    <h4 className="text-3xl font-black text-emerald-600 mb-2">{health?.avgInstructorRating?.toFixed(1) || '0.0'}</h4>
                    <div className="flex justify-center items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3 h-3 ${i < Math.round(health?.avgInstructorRating || 0) ? 'fill-current' : 'text-slate-200 dark:text-slate-700'}`} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Mentorship Yield</p>
                    <h4 className="text-3xl font-black text-blue-600 mb-2">{Math.round(health?.mentorshipCompletionRate || 0)}%</h4>
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
    );
};

export default PlatformHealthMetrics;
