import React, { useState } from 'react';
import type { IReview, ReviewResponse } from '../types/reviewTypes';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MoreVertical, Flag, Trash2, Edit } from 'lucide-react';
import { toggleHelpful, reportReview, deleteReview } from '../services/ReviewService';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface ReviewCardProps {
  review: IReview;
  currentUserId?: string | undefined;
  onUpdate: () => void;
  onEditRequest?: (review: IReview) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, currentUserId, onUpdate, onEditRequest }) => {
  const queryClient = useQueryClient();
  const [isHelpfulLoading, setIsHelpfulLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Optimistic local state for helpful
  const [isUpvoted, setIsUpvoted] = useState(review.isUpvotedByCurrentUser);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);

  const isOwner = currentUserId === review.studentId;

  const handleHelpfulClick = async () => {
    if (!currentUserId) {
        toast.error('Please log in to vote');
        return;
    }
    // Optimistic update
    const prevUpvoted = isUpvoted;
    const prevCount = helpfulCount;
    setIsUpvoted(!prevUpvoted);
    setHelpfulCount(prevUpvoted ? prevCount - 1 : prevCount + 1);

    try {
      setIsHelpfulLoading(true);
      await toggleHelpful(review.reviewId);
      // Update cache manually if we want to be thorough, but local state is enough for this toggle
    } catch {
      // Revert on failure
      setIsUpvoted(prevUpvoted);
      setHelpfulCount(prevCount);
      toast.error('Failed to update helpful status');
    } finally {
      setIsHelpfulLoading(false);
    }
  };

  const handleReport = async () => {
    try {
      await reportReview(review.reviewId);
      toast.success('Review reported to administrators');
      setShowMenu(false);
    } catch {
      toast.error('Failed to report review');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(review.reviewId);
      toast.success('Review deleted');

      // Manual Cache Update for all pages of reviews for this target
      queryClient.setQueriesData<ReviewResponse>(
        { queryKey: ['reviews', review.targetType, review.targetId] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            total: oldData.total - 1,
            reviews: oldData.reviews.filter(r => r.reviewId !== review.reviewId)
          };
        }
      );

      // Also invalidate summary so it stays in sync eventually, 
      // but we could manually update it too if we want "UI cache only"
      queryClient.invalidateQueries({ queryKey: ['ratingSummary', review.targetType, review.targetId] });
      
      onUpdate(); 
    } catch {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm relative ${isOwner ? 'border-indigo-500' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
            {review.student?.profileImageUrl ? (
              <img src={review.student.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
                {review.student?.name?.[0] || '*'}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {review.student?.name || 'Anonymous User'} {isOwner && '(You)'}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                • {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 z-20 py-1">
                {isOwner ? (
                    <>
                    <button 
                        onClick={() => { setShowMenu(false); onEditRequest?.(review); }}
                        className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                        onClick={() => { setShowMenu(false); handleDelete(); }}
                        className="w-full text-left cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    </>
                ) : (
                    <button 
                        onClick={handleReport}
                        className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                    <Flag className="w-4 h-4" /> Report
                    </button>
                )}
                </div>
            </>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
          {review.comment}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleHelpfulClick}
          disabled={isHelpfulLoading}
          className={`flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            isUpvoted 
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} />
          Helpful {helpfulCount > 0 && `(${helpfulCount})`}
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
