import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Activity, DollarSign } from 'lucide-react';
import Pulse from '@/shared/ui/Pulse';

interface RecentPayment {
    _id: string;
    amount: number;
    currency: string;
    adminFee: number;
    productName: string;
    studentName: string;
}

interface Props {
    payments: RecentPayment[] | undefined;
    itemVariants?: Variants;
}

const RecentPaymentsList: React.FC<Props> = ({ payments, itemVariants }) => {
    return (
        <motion.div 
            {...(itemVariants && { variants: itemVariants })}
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
                {payments && payments.length > 0 ? (
                    payments.map((p) => (
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
    );
};

export default RecentPaymentsList;
