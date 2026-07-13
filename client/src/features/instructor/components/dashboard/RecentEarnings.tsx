import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, DollarSign } from 'lucide-react';
import { ROUTES } from '@core/router/paths';
import type{ DashboardEarnings } from '../../hooks/useInstructorDashboard';

interface RecentEarningsProps {
    itemVariants: Variants;
    earnings: DashboardEarnings[];
    USD_TO_INR: number;
}

const RecentEarnings: React.FC<RecentEarningsProps> = ({ itemVariants, earnings, USD_TO_INR }) => {
    return (
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
                    earnings.slice(0, 5).map((item) => (
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
    );
};

export default RecentEarnings;
