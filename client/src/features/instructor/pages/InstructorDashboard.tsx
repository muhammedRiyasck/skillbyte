import React from 'react';
import { motion } from 'framer-motion';
import Spiner from '@shared/ui/Spiner';
import { useInstructorDashboard } from '../hooks/useInstructorDashboard';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import StripeBanners from '../components/dashboard/StripeBanners';
import DashboardStats from '../components/dashboard/DashboardStats';
import EarningsChart from '../components/dashboard/EarningsChart';
import ProfileBalanceCard from '../components/dashboard/ProfileBalanceCard';
import RecentEarnings from '../components/dashboard/RecentEarnings';
import WithdrawalsHistory from '../components/dashboard/WithdrawalsHistory';
import UpcomingSessions from '../components/dashboard/UpcomingSessions';
import EnrolledCourses from '../components/dashboard/EnrolledCourses';

const InstructorDashboard: React.FC = () => {
    const {
        isLoading,
        instructor,
        stats,
        earnings,
        chartData,
        availableBalance,
        availableBalanceINR,
        withdrawals,
        withdrawalsData,
        withdrawalsFetching,
        withdrawalPage,
        setWithdrawalPage,
        ITEMS_PER_PAGE,
        refetchWithdrawals,
        bookings,
        courses,
        isOnboarding,
        isWithdrawing,
        isSyncing,
        handleSetupPayouts,
        handleRequestWithdrawal,
        handleRefreshStatus,
        USD_TO_INR
    } = useInstructorDashboard();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center dark:bg-gray-800">
                <Spiner />
            </div>
        );
    }

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 260,
                damping: 24,
                mass: 0.8
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-4 md:p-8"
        >
            <div className="max-w-7xl mx-auto">
                <DashboardHeader itemVariants={itemVariants} />

                <StripeBanners 
                    itemVariants={itemVariants}
                    instructor={instructor}
                    isOnboarding={isOnboarding}
                    isSyncing={isSyncing}
                    handleSetupPayouts={handleSetupPayouts}
                    handleRefreshStatus={handleRefreshStatus}
                />

                <DashboardStats 
                    itemVariants={itemVariants}
                    stats={stats}
                />

                <div className="flex flex-col gap-10 mb-10">
                    <EarningsChart 
                        itemVariants={itemVariants}
                        chartData={chartData}
                        USD_TO_INR={USD_TO_INR}
                    />

                    <ProfileBalanceCard 
                        itemVariants={itemVariants}
                        instructor={instructor}
                        availableBalance={availableBalance}
                        availableBalanceINR={availableBalanceINR}
                        isWithdrawing={isWithdrawing}
                        handleRequestWithdrawal={handleRequestWithdrawal}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <RecentEarnings 
                        itemVariants={itemVariants}
                        earnings={earnings}
                        USD_TO_INR={USD_TO_INR}
                    />

                    <WithdrawalsHistory 
                        itemVariants={itemVariants}
                        withdrawals={withdrawals}
                        withdrawalsFetching={withdrawalsFetching}
                        isSyncing={isSyncing}
                        refetch={refetchWithdrawals}
                        USD_TO_INR={USD_TO_INR}
                        withdrawalPage={withdrawalPage}
                        setWithdrawalPage={setWithdrawalPage}
                        withdrawalsData={withdrawalsData}
                        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
                    />
                </div>

                <UpcomingSessions 
                    itemVariants={itemVariants}
                    bookings={bookings}
                />

                <EnrolledCourses 
                    itemVariants={itemVariants}
                    courses={courses}
                />
            </div>
        </motion.div>
    );
};

export default InstructorDashboard;
