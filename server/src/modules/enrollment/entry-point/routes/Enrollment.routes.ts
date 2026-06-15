import express from 'express';
import { enrollmentController } from '../EnrollmentContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import {
  UpdateLessonProgressSchema,
  InitiatePaymentSchema,
} from '../validations/EnrollmentValidation';

const router = express.Router();

// Check Enrollment Status - Protected Route
router.get(
  '/check/:id',
  authenticate,
  asyncHandler(
    enrollmentController.checkEnrollmentStatus.bind(enrollmentController),
  ),
);

// Get Student Enrolled Courses - Protected Route
router.get(
  '/my-enrollments',
  authenticate,
  asyncHandler(
    enrollmentController.getStudentEnrollments.bind(enrollmentController),
  ),
);

router.get(
  '/instructor-enrollments',
  authenticate,
  requireRole('instructor'),
  asyncHandler(
    enrollmentController.getInstructorEnrollments.bind(enrollmentController),
  ),
);

// Update Lesson Progress - Protected Route
router.patch(
  '/:enrollmentId/lesson-progress',
  authenticate,
  validateRequest(UpdateLessonProgressSchema),
  asyncHandler(enrollmentController.updateProgress.bind(enrollmentController)),
);

// Initiate Payment - Protected Route
router.post(
  '/initiate-payment',
  authenticate,
  validateRequest(InitiatePaymentSchema),
  asyncHandler(enrollmentController.initiatePayment.bind(enrollmentController)),
);

export default router;
