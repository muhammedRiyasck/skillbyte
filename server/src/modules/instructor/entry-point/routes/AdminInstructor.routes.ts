import { Router } from 'express';
const router = Router();

import { adminInstructorController } from '../dependencyInjection/AdminInstructorContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
router.get(
  '/getInstructors',
  authenticate,
  requireRole('admin'),
  asyncHandler(
  adminInstructorController.getInstructors)
);
router.patch(
  '/approve',
  authenticate,
  requireRole('admin'),
  asyncHandler(
  adminInstructorController.approve)
);
router.patch(
  '/decline',
  authenticate,
  requireRole('admin'),
  asyncHandler(
  adminInstructorController.decline)
);
router.patch(
  '/:instructorId/status',
  authenticate,
  requireRole('admin'),
  asyncHandler(
  adminInstructorController.changeInstructorStatus)
);

router.delete(
  '/:instructorId',
  authenticate,
  requireRole('admin'),
  asyncHandler(
  adminInstructorController.deleteInstructor)
);

router.get(
  '/:instructorId/resume',
  authenticate,
  requireRole('admin'),
  asyncHandler(
  adminInstructorController.getInstructorResume)
);

export default router;
