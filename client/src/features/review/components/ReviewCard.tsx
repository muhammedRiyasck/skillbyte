import React, { useState } from 'react';
import type { IReview, ReviewResponse } from '../types/reviewTypes';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MoreVertical, Flag, Trash2, Edit } from 'lucide-react';
import { toggleHelpful, submitReport, deleteReview } from '../services/ReviewService';
import { toast } from 'sonner';
import { useQueryClient, useMutation, type InfiniteData } from '@tanstack/react-query';
import ReportModal from '@/shared/components/ReportModal';
import AdminConfirmModal from '@/shared/ui/AdminConfirmModal';
import MotionDiv from '@/shared/ui/MotionDiv';

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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [imgError, setImgError] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Optimistic local state for helpful
  const [isUpvoted, setIsUpvoted] = useState(review.isUpvotedByCurrentUser);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);

  const isOwner = currentUserId === review.studentId;
  const isInstructorViewing = currentUserId === review.instructorId;

  const [isReviewDeleteModalOpen, setIsReviewDeleteModalOpen] = useState(false);

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

  const handleReportSubmit = async (reason: string, description: string) => {
    try {
      await submitReport('review', review.reviewId, reason, description);
      toast.success('Review reported to administrators');
    } catch {
      toast.error('Failed to report review');
      throw new Error('Failed to report');
    }
  };

  const handleDelete = async () => {
    setIsReviewDeleteModalOpen(true);
  };

  const confirmDeleteReview = async () => {
    try {
      setIsReviewDeleteModalOpen(false);
      await deleteReview(review.reviewId);
      toast.success('Review deleted');

      // Manual Cache Update for all pages of reviews for this target
      queryClient.setQueriesData<InfiniteData<ReviewResponse>>(
        { queryKey: ['reviews', review.targetType, review.targetId] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              total: page.total - 1,
              reviews: page.reviews.filter(r => r.reviewId !== review.reviewId)
            }))
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

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) => 
      import('../services/ReviewService').then(m => m.replyToReview(reviewId, reply)),
    onMutate: async ({ reviewId, reply }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['instructor-reviews'] });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueryData(['instructor-reviews']);

      // Optimistically update the cache
      queryClient.setQueriesData<InfiniteData<ReviewResponse>>({ queryKey: ['instructor-reviews'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            reviews: page.reviews.map((r) => 
              r.reviewId === reviewId 
                ? { ...r, instructorReply: reply, repliedAt: new Date().toISOString() } 
                : r
            )
          }))
        };
      });

      return { previousReviews };
    },
    onError: (_err, variables, context) => {
      if (context?.previousReviews) {
        queryClient.setQueriesData({ queryKey: ['instructor-reviews'] }, context.previousReviews);
      }
      if (variables.reply === '') {
        toast.error('Failed to delete reply');
      } else {
        toast.error('Failed to submit reply');
      }
    },
    onSuccess: (_data, variables) => {
      if (variables.reply === '') {
        toast.success('Reply deleted successfully');
      } else {
        toast.success('Reply submitted successfully');
      }
      setIsReplying(false);
      setReplyText('');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      onUpdate?.();
    }
  });

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ reviewId: review.reviewId, reply: replyText.trim() });
  };

  return (
    <div className={`relative p-6 rounded-xl border shadow-sm transition-all ${
      isOwner
        ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-300 dark:ring-indigo-700'
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
            {review.student?.profileImageUrl && !imgError ? (
              <img 
                src={review.student.profileImageUrl} 
                alt="avatar" 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 uppercase">
                {review.student?.name?.[0] || '?'}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {review.student?.name || 'Anonymous User'}
              {isOwner && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white">
                  ★ Your Review
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                • {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
            </div>
            {review.targetName && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                  {review.targetName}
                </span>
              </div>
            )}
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
                        className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 "
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
                        onClick={() => { setShowMenu(false); setIsReportModalOpen(true); }}
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

      {review.instructorReply && !isReplying && (
        <div className="mb-4 ml-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 relative">
          <div className="absolute -left-3 top-4 w-3 h-px bg-indigo-200 dark:bg-indigo-700"></div>
          <div className="absolute -left-3 top-0 bottom-4 w-px bg-indigo-200 dark:bg-indigo-700"></div>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Instructor Response
              </span>
              {review.repliedAt && (
                <span className="text-xs text-slate-400">
                  • {formatDistanceToNow(new Date(review.repliedAt), { addSuffix: true })}
                </span>
              )}
            </div>
            
            {isInstructorViewing && (
              <div className="flex gap-2">
                <button 
                  onClick={() => { setReplyText(review.instructorReply || ''); setIsReplying(true); }}
                  className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <AdminConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => {
              replyMutation.mutate({ reviewId: review.reviewId, reply: '' });
              setIsDeleteModalOpen(false);
            }}
            title="Clear Instructor Response?"
            description="Are you sure you want to remove your response to this review? This action can be undone later by posting a new reply."
            confirmText="Yes, Clear Response"
            variant="danger"
            isLoading={replyMutation.isPending}
            icon={<Trash2 size={32} />}
          />
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {review.instructorReply}
          </p>
        </div>
      )}

      {isInstructorViewing && !review.instructorReply && !isReplying && (
        <div className="mb-4">
          <button
            onClick={() => setIsReplying(true)}
            className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 cursor-pointer w-full outline-1 outline-gray-600 rounded p-2"
          >
            Reply to Student
          </button>
        </div>
      )}

      {isInstructorViewing && isReplying && (
        <MotionDiv className="mb-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your response to this review..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none mb-3"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setIsReplying(false); setReplyText(''); }}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                disabled={replyMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={replyMutation.isPending || (review.instructorReply ? replyText === review.instructorReply : !replyText.trim())}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {replyMutation.isPending ? 'Saving...' : review.instructorReply ? 'Update Reply' : 'Post Reply'}
              </button>
            </div>
          </div>
        </MotionDiv>
      )}

      {!isInstructorViewing && (
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
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        targetName={review.comment}
        targetType="review"
      />
      <AdminConfirmModal
        isOpen={isReviewDeleteModalOpen}
        onClose={() => setIsReviewDeleteModalOpen(false)}
        onConfirm={confirmDeleteReview}
        title="Delete Review?"
        description="Are you sure you want to permanently delete this review? This action cannot be undone and will affect the average rating."
        confirmText="Delete Permanently"
        variant="danger"
        icon={<Trash2 size={32} />}
      />
    </div>
  );
};

export default ReviewCard;
