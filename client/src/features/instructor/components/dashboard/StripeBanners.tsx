import React from 'react';
import { motion, type Variants } from 'framer-motion';
import type { InstructorProfile } from '../../hooks/useInstructorDashboard';
import {
    AlertCircle,
    ArrowUpRight,
    RefreshCw,
    ExternalLink,
    CheckCircle2
} from 'lucide-react';

interface StripeBannersProps {
    itemVariants: Variants;
    instructor: InstructorProfile | undefined;
    isOnboarding: boolean;
    isSyncing: boolean;
    handleSetupPayouts: () => void;
    handleRefreshStatus: () => void;
}

const StripeBanners: React.FC<StripeBannersProps> = ({
    itemVariants,
    instructor,
    isOnboarding,
    isSyncing,
    handleSetupPayouts,
    handleRefreshStatus
}) => {
    return (
        <>
            {!instructor?.stripeAccountId && (
                <motion.div 
                    variants={itemVariants}
                    className="mb-10 bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden"
                >
                    <div className="bg-white/5 backdrop-blur-md rounded-[2.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white relative">
                        <div className="relative z-10 flex items-center gap-8">
                            <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-xl border border-white/30 shadow-inner">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black tracking-tight">Enable Professional Payouts</h2>
                                <p className="text-blue-50 font-medium max-w-lg leading-relaxed">Join our elite instructors! Link your bank account via Stripe Connect to receive automatic earnings directly into your account.</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSetupPayouts}
                            disabled={isOnboarding}
                            className="relative z-10 cursor-pointer bg-white text-indigo-600 px-10 py-5 rounded-[1.5rem] font-black hover:bg-indigo-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-3 text-lg"
                        >
                            {isOnboarding ? 'Initializing...' : 'Set Up Payouts Now'}
                            {!isOnboarding && <ArrowUpRight className="w-6 h-6" />}
                        </button>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] -ml-32 -mb-32"></div>
                    </div>
                </motion.div>
            )}

            {instructor?.stripeAccountId && !instructor?.isStripeVerified && !window.location.search.includes('stripe=success') && (
                <motion.div 
                    variants={itemVariants}
                    className="mb-10 bg-gradient-to-br from-rose-600 to-pink-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/20"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                            <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-xl border border-white/30 shadow-lg">
                                <AlertCircle className="w-10 h-10 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-2">Verification Required</h2>
                                <p className="text-rose-50 font-medium max-w-md leading-relaxed">Stripe needs additional documentation to verify your identity. Payouts are temporarily paused until completion.</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleRefreshStatus}
                                disabled={isSyncing || isOnboarding}
                                className="cursor-pointer bg-white/10 text-white backdrop-blur-md px-8 py-4 rounded-[1.2rem] font-black hover:bg-white/20 transition-all border border-white/30 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? 'Syncing...' : 'Sync Status'}
                            </button>
                            <button
                                onClick={handleSetupPayouts}
                                disabled={isOnboarding || isSyncing}
                                className="cursor-pointer bg-white text-rose-600 px-8 py-4 rounded-[1.2rem] font-black hover:bg-rose-50 transition-all shadow-xl active:scale-95 flex items-center gap-3 disabled:opacity-50"
                            >
                                {isOnboarding ? 'Loading...' : 'Complete Verification'}
                                {!isOnboarding && <ExternalLink className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[80px]"></div>
                </motion.div>
            )}

            {window.location.search.includes('stripe=success') && (
                <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-4 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="w-6 h-6" />
                    <p className="font-bold">Payout method verified successfully! You can now request withdrawals of your earnings to your bank account.</p>
                </div>
            )}
        </>
    );
};

export default StripeBanners;
