import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { submitReview, updateReview } from '../services/ReviewService';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IReview, ReviewResponse } from '../types/reviewTypes';
import { useSelector } from 'react-redux';
import type { RootState } from '@/core/store/Index';

interface ReviewFormProps {
  targetType: 'course' | 'session';
  targetId: string;
  initialRating?: number;
  initialComment?: string;
  reviewId?: string; // If editing
  onSuccess: (rating: number) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  targetType,
  targetId,
  initialRating = 0,
  initialComment = '',
  reviewId,
  onSuccess,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);

  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
  }, [initialRating, initialComment]);

  const submitMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) => 
      reviewId 
        ? updateReview(reviewId, data) 
        : submitReview({ targetType, targetId, ...data }),
    onSuccess: (newReview: IReview) => {
      toast.success(reviewId ? 'Review updated successfully' : 'Review submitted successfully');
      
      // Ensure student info is populated for newly submitted reviews in the UI cache
      const studentData = newReview.student || (currentUser ? {
          name: currentUser.name,
          profileImageUrl: currentUser.profilePicture
      } : undefined);

      const reviewWithStudent: IReview = {
          ...newReview,
      };
      if (studentData) {
          reviewWithStudent.student = studentData;
      }

      // Manual Cache Update for reviews list
      queryClient.setQueriesData<ReviewResponse>(
        { queryKey: ['reviews', targetType, targetId] },
        (oldData) => {
            if (!oldData) return oldData;
            
            // If editing, find and replace
            if (reviewId) {
                return {
                    ...oldData,
                    reviews: oldData.reviews.map(r => r.reviewId === reviewId ? reviewWithStudent : r)
                };
            }
            
            // If adding new, prepend to page 1 recent 
            return {
                ...oldData,
                total: oldData.total + 1,
                reviews: [reviewWithStudent, ...oldData.reviews].slice(0, 5) // Limit to page size (5)
            };
        }
      );

      // Invalidate rating summary to fetch fresh average/distribution
      queryClient.invalidateQueries({ queryKey: ['ratingSummary', targetType, targetId] });
      
      onSuccess(newReview.rating);
    },

  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    submitMutation.mutate({ rating, comment });
  };

  const isSubmitting = submitMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Rating
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Review Comment (Optional)
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell others what you thought..."
          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
          maxLength={1000}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {comment.length} / 1000
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 cursor-pointer text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="px-6 py-2 text-sm cursor-pointer font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : reviewId ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
