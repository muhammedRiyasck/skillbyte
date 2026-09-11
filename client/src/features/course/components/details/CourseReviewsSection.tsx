import React from 'react';
import { CheckCircle, Pencil } from 'lucide-react';
import RatingSummary from '@features/review/components/RatingSummary';
import ReviewList from '@features/review/components/ReviewList';
import ReviewForm from '@features/review/components/ReviewForm';
import { UserRole } from '@shared/enums/UserRole';

interface CourseReviewsSectionProps {
  courseId: string;
  userId?: string | undefined;
  role?: UserRole | undefined;
  isEnrolled: boolean;
  showReviewForm: boolean;
  hasAlreadyReviewed: boolean;
  onOpenReviewForm: () => void;
  onCloseReviewForm: () => void;
  onReviewSuccess: () => void;
  onHasReview: (has: boolean) => void;
  onReviewSubmitted: () => void;
}

export const CourseReviewsSection: React.FC<CourseReviewsSectionProps> = ({
  courseId,
  userId,
  role,
  isEnrolled,
  showReviewForm,
  hasAlreadyReviewed,
  onOpenReviewForm,
  onCloseReviewForm,
  onReviewSuccess,
  onHasReview,
  onReviewSubmitted,
}) => {
  return (
    <section className="py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Community feedback
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-gray-950 dark:text-white sm:text-3xl">
            Student feedback
          </h2>
        </div>

        {role === UserRole.STUDENT &&
          isEnrolled &&
          !showReviewForm &&
          (hasAlreadyReviewed ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <CheckCircle className="h-3.5 w-3.5" />
              You've reviewed this course
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenReviewForm}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Add a review
            </button>
          ))}
      </div>

      {showReviewForm && (
        <div className="mt-7 rounded-2xl border border-gray-200 p-5 dark:border-gray-800 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
            Rate this course
          </h3>

          <div className="mt-5">
            <ReviewForm
              targetType="course"
              targetId={courseId}
              onSuccess={onReviewSuccess}
              onCancel={onCloseReviewForm}
            />
          </div>
        </div>
      )}

      <div className="mt-7">
        <RatingSummary targetType="course" targetId={courseId} />
      </div>

      <div className="mt-7">
        <ReviewList
          targetType="course"
          targetId={courseId}
          currentUserId={userId}
          onHasReview={onHasReview}
          onReviewSubmitted={onReviewSubmitted}
        />
      </div>
    </section>
  );
};

export default CourseReviewsSection;
