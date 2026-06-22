import { Router } from 'express';
import { reviewController } from '../dependencyInjection/ReviewContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import {
  SubmitReviewSchema,
  UpdateReviewSchema,
  ReplyToReviewSchema,
  AdminToggleHideSchema,
} from '../validations/ReviewValidation';

const router = Router();

// ── Admin-only routes (static paths MUST come before dynamic :reviewId routes) ──
router.get(
  '/admin',
  authenticate,
  requireRole('admin'),
  asyncHandler(reviewController.getAllReviewsAdmin),
);

router.patch(
  '/admin/:reviewId/toggle-hide',
  authenticate,
  requireRole('admin'),
  validateRequest(AdminToggleHideSchema),
  asyncHandler(reviewController.adminToggleHideReview),
);

router.delete(
  '/admin/:reviewId',
  authenticate,
  requireRole('admin'),
  asyncHandler(reviewController.adminDeleteReview),
);

// ── Student routes ────────────────────────────────────────────────────────────
router.post(
  '/',
  authenticate,
  requireRole('student'),
  validateRequest(SubmitReviewSchema),
  asyncHandler(reviewController.submitReview),
);

router.put(
  '/:reviewId',
  authenticate,
  requireRole('student'),
  validateRequest(UpdateReviewSchema),
  asyncHandler(reviewController.updateReview),
);

router.delete(
  '/:reviewId',
  authenticate,
  requireRole('student'),
  asyncHandler(reviewController.deleteReview),
);

router.post(
  '/:reviewId/helpful',
  authenticate,
  requireRole('student'),
  asyncHandler(reviewController.toggleHelpful),
);

// ── Instructor routes ─────────────────────────────────────────────────────────
router.get(
  '/instructor/my-reviews',
  authenticate,
  requireRole('instructor'),
  asyncHandler(reviewController.getInstructorReviews),
);

router.post(
  '/instructor/:reviewId/reply',
  authenticate,
  requireRole('instructor'),
  validateRequest(ReplyToReviewSchema),
  asyncHandler(reviewController.replyToReview),
);

// ── Shared authenticated routes ───────────────────────────────────────────────
router.get(
  '/my-session-ratings',
  authenticate,
  requireRole('student'),
  asyncHandler(reviewController.getMySessionRatings),
);

router.get(
  '/:targetType/:targetId/summary',
  authenticate,
  asyncHandler(reviewController.getRatingSummary),
);

router.get(
  '/:targetType/:targetId',
  authenticate,
  asyncHandler(reviewController.getReviews),
);

export default router;
