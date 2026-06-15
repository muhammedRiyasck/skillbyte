import { Router } from 'express';
const router = Router();

import { adminInstructorController } from '../dependencyInjection/AdminInstructorContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import {
  ApproveInstructorSchema,
  DeclineInstructorSchema,
  ChangeInstructorStatusSchema,
} from '../validations/AdminInstructorValidation';

router.get(
  '/getInstructors',
  authenticate,
  requireRole('admin'),
  asyncHandler(adminInstructorController.getInstructors),
);
router.patch(
  '/approve',
  authenticate,
  requireRole('admin'),
  validateRequest(ApproveInstructorSchema),
  asyncHandler(adminInstructorController.approve),
);
router.patch(
  '/decline',
  authenticate,
  requireRole('admin'),
  validateRequest(DeclineInstructorSchema),
  asyncHandler(adminInstructorController.decline),
);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  validateRequest(ChangeInstructorStatusSchema),
  asyncHandler(adminInstructorController.changeInstructorStatus),
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  asyncHandler(adminInstructorController.deleteInstructor),
);

router.get(
  '/:id/resume',
  authenticate,
  requireRole('admin'),
  asyncHandler(adminInstructorController.getInstructorResume),
);

export default router;
