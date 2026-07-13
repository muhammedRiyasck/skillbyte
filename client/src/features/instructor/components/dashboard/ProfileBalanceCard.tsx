import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Star, AlertCircle } from 'lucide-react';
import type { InstructorProfile } from '../../hooks/useInstructorDashboard';

interface ProfileBalanceCardProps {
    itemVariants: Variants;
    instructor: InstructorProfile | undefined;
    availableBalance: number;
    availableBalanceINR: number;
    isWithdrawing: boolean;
    handleRequestWithdrawal: (amount: number) => void;
}

const ProfileBalanceCard: React.FC<ProfileBalanceCardProps> = ({
    itemVariants,
    instructor,
    availableBalance,
    availableBalanceINR,
    isWithdrawing,
    handleRequestWithdrawal
}) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]"
        >
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl border border-white/30">
                            {instructor?.profilePicture ? <img className="w-full h-full rounded-2xl" src={instructor?.profilePicture} alt="" /> : <span className="text-2xl">{instructor?.name?.charAt(0) || 'I'}</span>}
                        </div>
                        <div>
                            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Instructor Account</p>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xl font-black">{instructor?.name}</h4>
                                {instructor?.averageRating !== undefined && instructor.totalReviews !== undefined && (
                                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 mt-0.5">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-bold text-white">{instructor.averageRating.toFixed(1)}</span>
                                        <span className="text-[10px] text-white/70">({instructor.totalReviews})</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                        <div className="flex flex-col">
                        <p className="text-indigo-100/60 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Available Balance</p>
                        <h2 className="text-6xl font-black mb-1 flex items-baseline gap-2">
                        <span className="text-2xl opacity-50">$</span>
                        {availableBalance.toLocaleString()}
                        </h2>
                        <p className="text-indigo-100 text-sm font-bold opacity-80 mb-6">≈ ₹{availableBalanceINR.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">Verified Partner
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex flex-col md:flex-row gap-4 my-6">
                        <button
                            onClick={() => handleRequestWithdrawal(availableBalance)}
                            disabled={availableBalance < 10 || isWithdrawing || !instructor?.isStripeVerified}
                            className="flex-1 bg-white text-indigo-700 py-4 rounded-2xl cursor-pointer font-black hover:bg-slate-50 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-lg"
                        >
                            {isWithdrawing ? 'Processing...' : 'Request Payout'}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase">
                        {availableBalance < 10 && (
                            <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Min $10 Needed
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/20 rounded-full blur-[80px] -ml-36 -mb-36"></div>
        </motion.div>
    );
};

export default ProfileBalanceCard;
