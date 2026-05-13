import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/core/router/paths';

interface TopInstructor {
    _id: string;
    name: string;
    profilePictureUrl?: string;
    totalEarnings: number;
    averageRating: number;
    totalReviews: number;
}

interface Props {
    instructors: TopInstructor[] | undefined;
    itemVariants?: Variants;
}

const TopInstructorsList: React.FC<Props> = ({ instructors, itemVariants }) => {
    return (
        <motion.div 
            {...(itemVariants && { variants: itemVariants })}
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
                {instructors && instructors.length > 0 ? (
                    instructors.map((inst) => (
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
    );
};

export default TopInstructorsList;
