import { Router } from 'express';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { adminDashboardContainer } from '../dependencyInjection/AdminDashboardContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { UserRole } from '../../../../shared/enums/UserRole';

const router = Router();

router.get(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN),
  asyncHandler(adminDashboardContainer.getDashboardData),
);

export default router;
