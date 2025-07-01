import { Router } from 'express';
const router = Router();

import { adminInstructorController } from '../dependencyInjection/adminInstructorContainer';
import { authenticate } from '../../../../shared/middlewares/authMiddleware';
import { requireRole } from '../../../../shared/middlewares/requireRole';
router.get(
  '/instructors/pending',
  authenticate,
  requireRole('admin'),
  adminInstructorController.getPending,
);
router.patch(
  '/instructors/:id/approve',
  authenticate,
  requireRole('admin'),
  adminInstructorController.approve,
);
router.patch(
  '/instructors/:id/decline',
  authenticate,
  requireRole('admin'),
  adminInstructorController.decline,
);
router.get(
  '/instructors/approved',
  authenticate,
  requireRole('admin'),
  adminInstructorController.listApproved,
);
router.patch(
  '/instructors/:id/status',
  authenticate,
  requireRole('admin'),
  adminInstructorController.changeStatus,
);

export default router;
