import React, { useState, useEffect, useCallback } from 'react';
import { getStudentPurchases } from '../../enrollment/services/EnrollmentService';
import { toast } from 'sonner';
import Spiner from '@shared/ui/Spiner';
import { RefreshCw, ReceiptText, Calendar, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Purchase {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    thumbnailUrl?: string;
  };
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  stripePaymentIntentId: string;
}

const PurchaseHistory: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const fetchPurchases = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const data = await getStudentPurchases(page, itemsPerPage);
      setPurchases(data?.data[0]?.data || []);
      setTotalCount(data?.data[0]?.totalCount[0]?.count || 0);
    } catch {
      toast.error('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchPurchases(currentPage);
  }, [currentPage, fetchPurchases]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && purchases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Spiner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 my-14">My Purchases</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your learning investments and view receipts</p>
          </div>
          <button
            onClick={() => fetchPurchases(currentPage)}
            disabled={loading}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-50 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ReceiptText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Purchases Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">You haven't purchased any courses yet. Start your learning journey today!</p>
            <Link to="/courses" className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all shadow-md active:scale-95">
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop View (Table) */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-bottom border-gray-100 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {purchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={purchase.courseId.thumbnailUrl || '/placeholder-course.png'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100"
                          />
                          <span className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                            {purchase.courseId.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(purchase.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {purchase.stripePaymentIntentId.slice(-10)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          {purchase.currency.toUpperCase()} {purchase.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase._id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                   <div className="flex items-start gap-4 mb-4">
                     <img
                        src={purchase.courseId.thumbnailUrl || '/placeholder-course.png'}
                        alt=""
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                         <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">{purchase.courseId.title}</h4>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(purchase.createdAt)}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Amount Paid</p>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{purchase.currency.toUpperCase()} {purchase.amount}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {purchase.status}
                      </span>
                   </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 cursor-pointer rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 cursor-pointer h-10 rounded-xl font-bold transition-all ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 cursor-pointer rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
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

export default PurchaseHistory;
