import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getInstructorEarnings } from '../../enrollment/services/EnrollmentService';
import { getInstructorProfile, getMyWithdrawals, createStripeOnboardingLink } from '../../instructor/services/InstructorDashboardService';
import { toast } from 'sonner';
import Spiner from '@shared/ui/Spiner';
import { RefreshCw, TrendingUp, Users, DollarSign, ArrowUpRight, Wallet, Clock, Search } from 'lucide-react';
import { useSocket } from '../../../context/SocketContext';

interface Earnings {
  id: string;
  studentName: string;
  studentEmail: string;   
  productName: string;
  productImage?: string;
  amount: number;
  adminFee: number;
  instructorAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

const EarningsHistory: React.FC = () => {
  const { socket } = useSocket();
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isStripeVerified, setIsStripeVerified] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsPerPage = 10;

  const fetchEarnings = useCallback(async (page: number, search?: string, filter?: string) => {
    try {
      setLoading(true);
      const [result, profileRes, withdrawalsRes] = await Promise.all([
        getInstructorEarnings(page, itemsPerPage, search, filter),
        getInstructorProfile(),
        getMyWithdrawals(1, 100)
      ]);
      const payload = result?.data;
      setEarnings(payload?.data || []);
      setTotalCount(payload?.totalCount || 0);
      setTotalRevenue(payload?.totalRevenue || 0);      
      setWithdrawnAmount(profileRes?.withdrawnAmount || 0);
      setTotalEarnings(profileRes?.totalEarnings || 0);
      setIsStripeVerified(profileRes?.isStripeVerified || false);
      
      const withdrawals = withdrawalsRes?.data || [];
      const pending = withdrawals
      // dont use any type
        .filter((w: { status: string; amount: number; }) => w?.status === 'PENDING')
        .reduce((sum: number, w: { status: string; amount: number; }) => sum + w?.amount, 0);
      setPendingAmount(pending);
    } catch {
      console.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Debounce search input — only fires the API call 500ms after the user stops typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  const handleSetupPayouts = async () => {
    try {
      setIsOnboarding(true);
      const response = await createStripeOnboardingLink();
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create onboarding link');
      }
    } catch (error) {
      console.error('Stripe onboarding error:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsOnboarding(false);
    }
  };

  useEffect(() => {
    fetchEarnings(currentPage, searchTerm || undefined, filterType !== 'all' ? filterType : undefined);
  }, [currentPage, searchTerm, filterType, fetchEarnings]);

  useEffect(() => {
    if (!socket) return;
    const handleNotification = (notification: { title?: string }) => {
      if (notification.title && (notification.title.includes('Restricted') || notification.title.includes('Verified'))) {
        fetchEarnings(currentPage, searchTerm || undefined, filterType !== 'all' ? filterType : undefined);
      }
    };
    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, currentPage, searchTerm, filterType, fetchEarnings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

 
  if (loading && earnings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-800">
        <Spiner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Financial Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your sales, track earnings, and analyze performance</p>
          </div>
          {isStripeVerified && (
            <div>
              <button
                onClick={handleSetupPayouts}
                disabled={isOnboarding}
                className="flex items-center cursor-pointer justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Wallet className="w-4 h-4 text-indigo-500" />
                {isOnboarding ? 'Loading...' : 'Manage Payout Settings'}
              </button>
            </div>
          )}
        </div>

        {!isStripeVerified && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-6 rounded-[2rem] mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg mb-1">Action Required: Set up Payouts</h3>
              <p className="text-indigo-600 dark:text-indigo-300 text-sm">You need to connect your bank account via Stripe to receive your earnings and request withdrawals.</p>
            </div>
            <button 
              onClick={handleSetupPayouts}
              disabled={isOnboarding}
              className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50"
            >
              {isOnboarding ? 'Loading...' : 'Connect Stripe'}
            </button>
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-700 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl text-green-600">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Sales</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900 dark:text-gray-100">{formatCurrency(totalRevenue, 'USD')}</span>
              <span className="text-sm text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-lg">+12%</span>
            </div>
            <div className="text-sm font-medium text-gray-400 mt-1">
               {formatCurrency(totalRevenue * 83, 'INR')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
                  <DollarSign className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Net Profit</span>
            </div>
            <div className="text-4xl font-black text-gray-900 dark:text-gray-100">{formatCurrency(totalEarnings, 'USD')}</div>
            <div className="text-sm font-medium text-gray-400 mt-1">
               {formatCurrency(totalEarnings * 83, 'INR')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600 ring-2 ring-indigo-500/20">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600">
                  <Wallet className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-indigo-500 uppercase tracking-widest">Available Balance</span>
            </div>
            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(Math.max(0, totalEarnings - withdrawnAmount), 'USD')}
            </div>
            <div className="text-sm font-medium text-indigo-400/70 mt-1">
               {formatCurrency(Math.max(0, totalEarnings - withdrawnAmount) * 83, 'INR')}
            </div>
          </div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4 mb-3">
               <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-2xl text-emerald-600">
                  <ArrowUpRight className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Withdrawn</span>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{formatCurrency(withdrawnAmount, 'USD')}</div>
            <div className="text-xs font-medium text-gray-400 mt-1">
               {formatCurrency(withdrawnAmount * 83, 'INR')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4 mb-3">
               <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-2xl text-amber-600">
                  <Clock className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pending Requests</span>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{formatCurrency(pendingAmount, 'USD')}</div>
            <div className="text-xs font-medium text-gray-400 mt-1">
               {formatCurrency(pendingAmount * 83, 'INR')}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4 mb-3">
               <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-2xl text-purple-600">
                  <Users className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Students</span>
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{totalCount}</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              id="earnings-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by student name, email or course..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all shadow-sm"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-bold px-2 py-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              id="earnings-filter"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="appearance-none w-full sm:w-48 px-5 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all shadow-sm cursor-pointer pr-10"
            >
              <option value="all">All Transactions</option>
              <option value="course">Courses Only</option>
              <option value="mentorship">Mentorships Only</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={() => fetchEarnings(currentPage, searchTerm || undefined, filterType !== 'all' ? filterType : undefined)}
            disabled={loading}
            className="flex cursor-pointer items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50 font-semibold text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>

        {earnings.length === 0 && !loading ? (
          <div className="text-center py-20 bg-white dark:bg-gray-700 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <h3 className="text-xl font-bold text-gray-400">No transactions recorded yet</h3>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-700 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-600 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Course</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sale Price</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Platform Fee</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Your Profit</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                  {earnings.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase">
                            {item.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">{item.studentName}</p>
                            <p className="text-xs text-gray-500">{item.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors cursor-pointer">
                            {item.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-600 dark:text-gray-400">{formatCurrency(item.amount, item.currency)}</span>
                          <span className="text-xs text-gray-400">
                            {item.currency.toUpperCase() === 'INR' 
                              ? formatCurrency(item.amount / 83, 'USD')
                              : formatCurrency(item.amount * 83, 'INR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-red-400 font-medium">-{formatCurrency(item.adminFee, item.currency)}</span>
                          <span className="text-xs text-red-300/70">
                            -{item.currency.toUpperCase() === 'INR' 
                              ? formatCurrency(item.adminFee / 83, 'USD')
                              : formatCurrency(item.adminFee * 83, 'INR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-black text-green-600 dark:text-green-400 text-lg">
                            {formatCurrency(item.instructorAmount, item.currency)}
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <span className="text-xs text-green-600/60 dark:text-green-400/60 font-semibold mt-0.5">
                            {item.currency.toUpperCase() === 'INR' 
                              ? formatCurrency(item.instructorAmount / 83, 'USD')
                              : formatCurrency(item.instructorAmount * 83, 'INR')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-bold text-gray-500">{formatDate(item.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 p-8 bg-gray-50/30 dark:bg-gray-800/30">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 cursor-pointer rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="font-bold text-gray-400">Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 cursor-pointer rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsHistory;
