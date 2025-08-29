import { Router } from 'express';
const router = Router();

import { adminInstructorController } from '../dependencyInjection/AdminInstructorContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
router.get(
  '/pendings',
  authenticate,
  requireRole('admin'),
  adminInstructorController.getPending
);
router.patch(
  '/approve',
  authenticate,
  requireRole('admin'),
  adminInstructorController.approve
);
router.patch(
  '/decline',
  authenticate,
  requireRole('admin'),
  adminInstructorController.decline
);
router.get(
  '/approved',
  authenticate,
  requireRole('admin'),
  adminInstructorController.listApproved
);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  adminInstructorController.changeStatus
);

export default router;
