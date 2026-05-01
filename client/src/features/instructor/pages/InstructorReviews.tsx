import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getInstructorReviews } from '@features/review/services/ReviewService';
import ReviewCard from '@features/review/components/ReviewCard';
import { MessageSquare, BookOpen, Users, RotateCw, Star, Filter, ArrowUpDown, ChevronDown, X } from 'lucide-react';
import Spiner from '@shared/ui/Spiner';

const InstructorReviews = () => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  const [activeTab, setActiveTab] = useState<'course' | 'session'>('course');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const limit = 10;

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['instructor-reviews', activeTab, rating, status, sortBy, sortOrder],
    queryFn: ({ pageParam = 1 }) => getInstructorReviews({ 
      targetType: activeTab, 
      rating, 
      status, 
      sortBy, 
      sortOrder, 
      page: pageParam, 
      limit 
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.reviews.length, 0);
      return totalLoaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isFiltered = rating !== undefined || status !== 'all' || sortBy !== 'createdAt' || sortOrder !== 'desc';

  const resetFilters = () => {
    setRating(undefined);
    setStatus('all');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  React.useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const reviews = data?.pages.flatMap((page) => page.reviews) || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-indigo-600" />
              Reviews & Feedback
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              View and respond to feedback from your students across all courses and mentorship sessions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isFiltered && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <X size={16} />
                Reset
              </button>
            )}
            <button 
              onClick={() => refetch()}
              className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm cursor-pointer ${isRefetching ? 'animate-spin' : ''}`}
              title="Refresh reviews"
            >
              <RotateCw size={20} />
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab('course');
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer font-bold transition-all ${
                activeTab === 'course'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Course Reviews
            </button>
            <button
              onClick={() => {
                setActiveTab('session');
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer font-bold transition-all ${
                activeTab === 'session'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-5 h-5" />
              Mentorship Feedback
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Rating Filter */}
            <div className="relative group flex-1 md:flex-none min-w-[120px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none">
                <Star size={16} />
              </div>
              <select 
                value={rating || ''}
                onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars & Up</option>
                <option value="3">3 Stars & Up</option>
                <option value="2">2 Stars & Up</option>
                <option value="1">1 Star & Up</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative group flex-1 md:flex-none min-w-[140px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none">
                <Filter size={16} />
              </div>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Needs Reply</option>
                <option value="replied">Replied</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Sorting */}
            <div className="relative group flex-1 md:flex-none min-w-[160px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors pointer-events-none">
                <ArrowUpDown size={16} />
              </div>
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Review List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6 md:p-8 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spiner />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.reviewId}
                  review={review}
                  currentUserId={review.instructorId} // Pass instructor ID so it knows it can reply
                  onUpdate={() => refetch()}
                />
              ))}

              {/* Loading sentinel */}
              <div ref={ref} className="py-8 flex flex-col items-center justify-center">
                {isFetchingNextPage && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                )}
                {!hasNextPage && reviews.length > 0 && (
                  <div className="text-slate-400 text-sm font-medium flex items-center gap-2">
                    <div className="h-px w-8 bg-slate-200 dark:bg-slate-700"></div>
                    No more reviews to show
                    <div className="h-px w-8 bg-slate-200 dark:bg-slate-700"></div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-4">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-bold">No {activeTab} reviews found.</p>
              {isFiltered ? (
                <>
                  <p className="text-sm mb-4">Try adjusting your filters to find what you're looking for.</p>
                  <button 
                    onClick={resetFilters}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </>
              ) : (
                <p className="text-sm">When students leave feedback, it will appear here.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorReviews;
