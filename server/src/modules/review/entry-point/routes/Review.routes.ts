import { Router } from 'express';
import { reviewController } from '../dependencyInjection/ReviewContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';

const router = Router();

// Routes for student to submit, edit, delete reviews
router.post(
  '/',
  authenticate,
  requireRole('student'),
  asyncHandler(reviewController.submitReview),
);

router.put(
  '/:reviewId',
  authenticate,
  requireRole('student'),
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

// Public/Authenticated routes for retrieving reviews
router.get(
  '/:targetType/:targetId',
  authenticate,
  asyncHandler(reviewController.getReviews),
);

router.get(
  '/:targetType/:targetId/summary',
  authenticate,
  asyncHandler(reviewController.getRatingSummary),
);

router.post(
  '/:reviewId/report',
  authenticate,
  asyncHandler(reviewController.reportReview),
);

router.get(
  '/my-session-ratings',
  authenticate,
  requireRole('student'),
  asyncHandler(reviewController.getMySessionRatings),
);

export default router;
