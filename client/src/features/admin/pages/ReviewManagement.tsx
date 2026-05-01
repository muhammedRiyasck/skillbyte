import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminReviews, toggleHideReview, deleteReview, type AdminReviewFilters } from '../services/AdminReviewService';
import type { ReviewResponse } from '@features/review/types/reviewTypes';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ChevronDown, 
  X, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Trash2, 
  Star, 
  Calendar, 
  BookOpen, 
  User,
  SortAsc,
  SortDesc,
  AlertCircle
} from 'lucide-react';
import { Pagination, AdminConfirmModal } from '@/shared/ui';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AdminReviewFilters>({
    page: 1,
    limit: 12,
    targetType: 'all',
    isHidden: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: ''
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters.page]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['adminReviews', filters],
    queryFn: () => getAdminReviews(filters),
  });

  const hideMutation = useMutation({
    mutationFn: ({ reviewId, hide }: { reviewId: string, hide: boolean }) => toggleHideReview(reviewId, hide),
    onSuccess: (_, variables) => {
      toast.success(`Review ${variables.hide ? 'hidden' : 'unhidden'} successfully`);
      queryClient.setQueryData<ReviewResponse>(['adminReviews', filters], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          reviews: oldData.reviews.map((r) => 
            r.reviewId === variables.reviewId ? { ...r, isHidden: variables.hide } : r
          )
        };
      });
    },
    onError: () => toast.error('Failed to update review visibility')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: (_, reviewId) => {
      toast.success('Review deleted permanently');
      queryClient.setQueryData<ReviewResponse>(['adminReviews', filters], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          total: oldData.total - 1,
          reviews: oldData.reviews.filter((r) => r.reviewId !== reviewId)
        };
      });
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete review')
  });

  const handleFilterChange = <K extends keyof AdminReviewFilters>(key: K, value: AdminReviewFilters[K]) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value, 
      page: key === 'page' ? value : 1 
    }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: 10,
      targetType: 'all',
      isHidden: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      search: ''
    });
  };

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/30">
              <MessageSquare className="text-white w-8 h-8" />
            </div>
            Review Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Monitor and moderate all course and mentorship session reviews.
          </p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 border cursor-pointer ${
              isFilterOpen 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' 
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            <Filter size={18} />
            Filters
            {isFilterOpen ? <X size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white cursor-pointer dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Search size={14} /> Search Comment
                </label>
                <input 
                  type="text"
                  placeholder="Search reviews..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Target Type</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  value={filters.targetType}
                  onChange={(e) => handleFilterChange('targetType', e.target.value)}
                >
                  <option value="all">All Content</option>
                  <option value="course">Courses</option>
                  <option value="session">Mentorship Sessions</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Visibility</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white cursor-pointer"
                  value={String(filters.isHidden)}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleFilterChange('isHidden', val === 'all' ? 'all' : val === 'true');
                  }}
                >
                  <option value="all">All Visibility</option>
                  <option value="false">Visible Only</option>
                  <option value="true">Hidden Only</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Sort By</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="createdAt">Date</option>
                    <option value="rating">Rating</option>
                    <option value="helpfulCount">Helpful Count</option>
                  </select>
                  <button 
                    onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all dark:text-white"
                  >
                    {filters.sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={clearFilters}
                className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} /> Reset Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/20 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Student</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Content</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Rating & Comment</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Helpful</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-full" />
                    </td>
                  </tr>
                ))
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <AlertCircle className="w-12 h-12 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">No reviews found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search query.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.reviewId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 relative">
                          {review.studentProfilePic ? (
                            <img 
                              src={review.studentProfilePic} 
                              className="w-10 h-10 rounded-xl object-cover" 
                              alt={review.studentName}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold"
                            style={{ display: review.studentProfilePic ? 'none' : 'flex' }}
                          >
                            {review.studentName.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{review.studentName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">ID: ...{review.studentId.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {review.targetType === 'course' ? (
                          <BookOpen size={14} className="text-blue-500" />
                        ) : (
                          <User size={14} className="text-purple-500" />
                        )}
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{review.targetType}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">ID: ...{review.targetId.slice(-6)}</p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center gap-1 text-orange-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-300"} />
                        ))}
                        <span className="text-xs font-black ml-1 text-slate-700 dark:text-slate-300">{review.rating}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 italic font-medium">
                        "{review.comment || 'No comment provided'}"
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                        {review.helpfulCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {review.isHidden ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                          <EyeOff size={12} /> Hidden
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                          <Eye size={12} /> Visible
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 font-medium">
                        <Calendar size={10} /> {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => hideMutation.mutate({ reviewId: review.reviewId, hide: !review.isHidden })}
                          disabled={hideMutation.isPending}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            review.isHidden 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200' 
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 hover:bg-amber-200'
                          }`}
                          title={review.isHidden ? "Show Review" : "Hide Review"}
                        >
                          {review.isHidden ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button 
                          onClick={() => setDeleteId(review.reviewId)}
                          disabled={deleteMutation.isPending}
                          className="p-2 bg-red-100 cursor-pointer dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                          title="Delete Permanently"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:row justify-between items-center gap-4">
        
          {totalPages > 1 && (
            <Pagination 
              page={filters.page || 1} 
              totalPages={totalPages} 
              onPageChange={(p) => handleFilterChange('page', p)} 
            />
          )}
        </div>
      </div>

      <AdminConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSuccess: () => setDeleteId(null)
            });
          }
        }}
        title="Permanently Delete Review?"
        description="Are you sure you want to PERMANENTLY delete this review? This action cannot be undone and the review will be removed from all public ratings."
        confirmText="Yes, Delete Permanently"
        variant="danger"
        isLoading={deleteMutation.isPending}
        icon={<Trash2 size={32} />}
      />
    </div>
  );
};

export default ReviewManagement;
