import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { RefreshCw, ExternalLink, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WithdrawalItem } from '../../hooks/useInstructorDashboard';

interface WithdrawalsHistoryProps {
    itemVariants: Variants;
    withdrawals: WithdrawalItem[];
    withdrawalsFetching: boolean;
    isSyncing: boolean;
    refetch: () => void;
    USD_TO_INR: number;
    withdrawalPage: number;
    setWithdrawalPage: React.Dispatch<React.SetStateAction<number>>;
    withdrawalsData: { data: WithdrawalItem[]; pagination: { total: number; page: number; limit: number } } | undefined;
    ITEMS_PER_PAGE: number;
}

const WithdrawalsHistory: React.FC<WithdrawalsHistoryProps> = ({
    itemVariants,
    withdrawals,
    withdrawalsFetching,
    isSyncing,
    refetch,
    USD_TO_INR,
    withdrawalPage,
    setWithdrawalPage,
    withdrawalsData,
    ITEMS_PER_PAGE
}) => {
    return (
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
    );
};

export default WithdrawalsHistory;
