import React, { useState, useEffect, useCallback } from 'react';
import { getInstructorEarnings } from '../../enrollment/services/EnrollmentService';
import { toast } from 'sonner';
import Spiner from '@shared/ui/Spiner';
import { RefreshCw, TrendingUp, Users, DollarSign, ArrowUpRight } from 'lucide-react';

interface Earnings {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    title: string;
    thumbnailUrl?: string;
  };
  amount: number;
  adminFee: number;
  instructorAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

const EarningsHistory: React.FC = () => {
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const itemsPerPage = 10;

  const fetchEarnings = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const data = await getInstructorEarnings(page, itemsPerPage);
      setEarnings(data?.data[0]?.data || []);
      setTotalCount(data?.data[0]?.totalCount[0]?.count || 0);
      setTotalRevenue(data?.data[0]?.totalRevenue[0]?.total || 0);
      setTotalProfit(data?.data[0]?.totalProfit[0]?.total || 0);
    } catch {
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchEarnings(currentPage);
  }, [currentPage, fetchEarnings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Financial Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your sales, track earnings, and analyze performance</p>
          </div>
          <button
            onClick={() => fetchEarnings(currentPage)}
            disabled={loading}
            className="flex cursor-pointer items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-700 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl text-green-600">
                  <TrendingUp className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Sales</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900 dark:text-gray-100">₹{totalRevenue.toLocaleString()}</span>
              <span className="text-sm text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-lg">+12%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
                  <DollarSign className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Net Profit</span>
            </div>
            <div className="text-4xl font-black text-gray-900 dark:text-gray-100">₹{totalProfit.toLocaleString()}</div>
          </div>

          <div className="bg-white dark:bg-gray-700 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-4 mb-4">
               <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl text-purple-600">
                  <Users className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Students</span>
            </div>
            <div className="text-4xl font-black text-gray-900 dark:text-gray-100">{totalCount}</div>
          </div>
        </div>

        {earnings.length === 0 ? (
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
                    <tr key={item._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-gray-600 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase">
                            {item.userId.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">{item.userId.name}</p>
                            <p className="text-xs text-gray-500">{item.userId.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors cursor-pointer">
                          {item.courseId.title}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-medium text-gray-600 dark:text-gray-400">₹{item.amount}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-red-400 font-medium">-₹{(item.adminFee).toFixed(2)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 font-black text-green-600 dark:text-green-400 text-lg">
                          ₹{item.instructorAmount}
                          <ArrowUpRight className="w-4 h-4" />
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
