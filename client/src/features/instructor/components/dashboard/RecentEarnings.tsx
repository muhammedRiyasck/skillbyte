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
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group gap-4 sm:gap-0">
                            <div className="flex items-start sm:items-center gap-4">
                                {item.productImage ? (
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0">
                                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg border border-indigo-100 dark:border-indigo-500/20 shrink-0">
                                        {item.productName?.charAt(0) || '$'}
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">{item.productName || 'Unknown Product'}</p>
                                        {item.courseId ? (
                                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/20 shrink-0">Course</span>
                                        ) : item.mentorshipBookingId ? (
                                            <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full border border-purple-100 dark:border-purple-500/20 shrink-0">Mentorship</span>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                        {item.studentName ? (
                                            <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.studentName}</span>
                                        ) : (
                                            <span>Student</span>
                                        )}
                                        <span className="mx-1 opacity-50">•</span>
                                        {new Date(item.createdAt ?? '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                {item.currency === 'INR' ? (
                                    <>
                                        <p className="font-black text-slate-900 dark:text-white text-lg whitespace-nowrap">
                                            ₹{item.amount.toLocaleString()} <span className="text-sm text-slate-400 font-normal">(${(item.amount / USD_TO_INR).toFixed(2)})</span>
                                        </p>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter mt-0.5">
                                            Cut: ₹{(item.instructorAmount || item.amount).toLocaleString()} <span className="text-emerald-500/70 font-normal">(${( (item.instructorAmount || item.amount) / USD_TO_INR ).toFixed(2)})</span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-black text-slate-900 dark:text-white text-lg whitespace-nowrap">
                                            ${item.amount.toLocaleString()} <span className="text-sm text-slate-400 font-normal">(₹{Math.round(item.amount * USD_TO_INR).toLocaleString()})</span>
                                        </p>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tighter mt-0.5">
                                            Cut: ${(item.instructorAmount || item.amount).toLocaleString()} <span className="text-emerald-500/70 font-normal">(₹{Math.round( (item.instructorAmount || item.amount) * USD_TO_INR ).toLocaleString()})</span>
                                        </p>
                                    </>
                                )}
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
