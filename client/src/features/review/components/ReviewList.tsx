import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReviews } from '../services/ReviewService';
import type { IReview } from '../types/reviewTypes';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

interface ReviewListProps {
  targetType: 'course' | 'session';
  targetId: string;
  currentUserId?: string | undefined;
  onReviewSubmitted?: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ targetType, targetId, currentUserId, onReviewSubmitted }) => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'recent' | 'helpful'>('recent');
  const [editingReview, setEditingReview] = useState<IReview | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', targetType, targetId, sort, page],
    queryFn: () => getReviews(targetType, targetId, sort, page, 5),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const reviews = data?.reviews || [];
  const total = data?.total || 0;

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

  const totalPages = Math.ceil(total / 5);

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
                  setPage(1);
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
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              currentUserId={currentUserId}
              onUpdate={handleUpdate}
              onEditRequest={handleEditRequest}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                Prev
            </button>
            <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
            </span>
            <button 
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                Next
            </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
