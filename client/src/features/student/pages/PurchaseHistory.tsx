import React, { useState, useEffect, useCallback } from 'react';
import { getStudentPurchases } from '../../enrollment/services/EnrollmentService';
import { toast } from 'sonner';
import Spiner from '@shared/ui/Spiner';
import { RefreshCw, ReceiptText, Calendar, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Purchase {
  id: string;
  productName: string;
  productImage?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
}

const PurchaseHistory: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const fetchPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (dateFilter !== 'all') filters.dateRange = dateFilter;

      const data = await getStudentPurchases(page, itemsPerPage, filters);
      setPurchases(data?.data?.purchases || []);
      setTotalCount(data?.data?.totalCount || 0);
    } catch {
      toast.error('Failed to load purchase history');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, dateFilter]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (isLoading && purchases.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Spiner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Container removed, header handles layout */}
      <div className="lg:sticky top-0 z-10 bg-white dark:bg-gray-900 pt-4 pb-2 border-b border-gray-200 dark:border-gray-700 mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 lg:mb-4">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ReceiptText className="w-8 h-8 text-indigo-600" />
            My Purchases
          </h1>
          <button
            onClick={() => fetchPurchases()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg cursor-pointer"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="px-6 pb-2">
          <div className="flex flex-col md:flex-row gap-4 mb-4 mt-8 lg:mt-0">
             <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="px-2 py-2 rounded-lg bg-gray-50 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="30_days">Last 30 Days</option>
              <option value="3_months">Last 3 Months</option>
              <option value="last_year">Last Year</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer capitalize"
            >
              <option value="all">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
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
            <div className="hidden md:block bg-white dark:bg-gray-800 mx-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-bottom border-gray-100 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={purchase.productImage || '/placeholder-course.png'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {purchase.productName}
                            </div>
                          </div>
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
                          {purchase.stripePaymentIntentId ? purchase.stripePaymentIntentId.slice(-10) : purchase.paypalOrderId?.slice(-10)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {purchase.stripePaymentIntentId ? 'Stripe' : 'PayPal'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          {purchase.currency.toUpperCase()} {purchase.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${purchase.status === 'succeeded' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : purchase.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${purchase.status === 'succeeded' ? 'bg-green-600' : purchase.status === 'failed' ? 'bg-red-600' : 'bg-yellow-400'}`}></span>
                          {purchase.status.toUpperCase()}
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
                <div key={purchase.id} className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                   <div className="flex items-start gap-4 mb-4">
                     <img
                        src={purchase.productImage || '/placeholder-course.png'}
                        alt=""
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div className="flex-1">
                         <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">
                           {purchase.productName}
                         </h4>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(purchase.createdAt)}</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Amount Paid</p>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{purchase.currency.toUpperCase()} {purchase.amount}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${purchase.status === 'succeeded' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : purchase.status === 'failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${purchase.status === 'succeeded' ? 'bg-green-600' : purchase.status === 'failed' ? 'bg-red-600' : 'bg-yellow-400'}`}></span>
                        {purchase.status.toUpperCase()}
                      </span>
                   </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={page === 1 || isLoading}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 cursor-pointer rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 cursor-pointer h-10 rounded-xl font-bold transition-all ${
                        page === i + 1
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page === totalPages || isLoading}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 cursor-pointer rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default PurchaseHistory;
