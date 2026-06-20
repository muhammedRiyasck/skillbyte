import { Router } from 'express';
import { reportController } from '../dependencyInjection/ReportContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { UserRole } from '../../../../shared/enums/UserRole';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import { SubmitReportSchema } from '../validations/ReportValidation';

const router = Router();

// Student facing route
router.post(
  '/',
  authenticate,
  requireRole(UserRole.STUDENT),
  validateRequest(SubmitReportSchema),
  asyncHandler(reportController.submitReport),
);

// Admin facing routes
router.get(
  '/admin',
  authenticate,
  requireRole(UserRole.ADMIN),
  asyncHandler(reportController.getPendingReports),
);

router.patch(
  '/admin/:reportId/dismiss',
  authenticate,
  requireRole(UserRole.ADMIN),
  asyncHandler(reportController.dismissReport),
);

router.post(
  '/admin/:reportId/action',
  authenticate,
  requireRole(UserRole.ADMIN),
  asyncHandler(reportController.actionReport),
);

export default router;
