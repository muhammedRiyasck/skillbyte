import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { getReviews } from '../services/ReviewService';
import type { IReview } from '../types/reviewTypes';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { useEffect, useState } from 'react';

interface ReviewListProps {
  targetType: 'course' | 'session';
  targetId: string;
  currentUserId?: string | undefined;
  onReviewSubmitted?: () => void;
  onHasReview?: (hasReview: boolean) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ targetType, targetId, currentUserId, onReviewSubmitted, onHasReview }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });
  const [sort, setSort] = useState<'recent' | 'helpful'>('recent');
  const [editingReview, setEditingReview] = useState<IReview | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['reviews', targetType, targetId, sort],
    queryFn: ({ pageParam = 1 }) => getReviews(targetType, targetId, sort, pageParam, 2),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.reviews.length, 0);
      return totalLoaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const reviews = data?.pages.flatMap((page) => page.reviews) || [];
  const total = data?.pages[0]?.total || 0;

  // Detect if current user has already submitted a review
  const currentUserReview = currentUserId
    ? reviews.find(r => r.studentId === currentUserId)
    : null;

  // Notify parent when user's review status is known
  useEffect(() => {
    if (!isLoading && onHasReview) {
      onHasReview(!!currentUserReview);
    }
  }, [currentUserReview, isLoading, onHasReview]);

  // Sort: put current user's review at the top
  const sortedReviews = currentUserReview
    ? [currentUserReview, ...reviews.filter(r => r.reviewId !== currentUserReview.reviewId)]
    : reviews;

  const handleUpdate = () => {
    // This will be handled by mutation manual cache updates or invalidation
    if (onReviewSubmitted) onReviewSubmitted();
  };

  const handleEditRequest = (review: IReview) => {
    setEditingReview(review);
  };

  const cancelEdit = () => {
    setEditingReview(null);
  };

  const handleEditSuccess = () => {
    setEditingReview(null);
    if (onReviewSubmitted) onReviewSubmitted();
  }

  return (
    <div className="space-y-6">
      {editingReview && (
         <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Edit Review</h3>
            <ReviewForm 
                targetType={targetType}
                targetId={targetId}
                initialRating={editingReview.rating}
                initialComment={editingReview.comment}
                reviewId={editingReview.reviewId}
                onSuccess={handleEditSuccess}
                onCancel={cancelEdit}
            />
         </div>
      )}

      {!editingReview && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              showing {reviews.length} of {total} reviews
            </span>
            <select
              value={sort}
              onChange={(e) => {
                  setSort(e.target.value as 'recent' | 'helpful');
              }}
              className="bg-white border text-sm border-gray-300 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="recent">Most Recent</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              currentUserId={currentUserId}
              onUpdate={handleUpdate}
              onEditRequest={handleEditRequest}
            />
          ))}

          {/* Loading sentinel */}
          <div ref={ref} className="py-4 flex justify-center">
             {isFetchingNextPage && (
               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
             )}
             {!hasNextPage && reviews.length > 0 && (
               <p className="text-xs text-gray-400 font-medium italic">You've reached the end of reviews</p>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
