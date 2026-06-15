import Router from 'express';
import { adminStudentController } from '../dependencyInjection/AdminStudentContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { ChangeStudentStatusSchema } from '../validations/AdminStudentValidation';

const router = Router();

router.get(
  '/allStudents',
  authenticate,
  requireRole('admin'),
  asyncHandler(adminStudentController.getAllStudents),
);

router.patch(
  '/change-status',
  authenticate,
  requireRole('admin'),
  validateRequest(ChangeStudentStatusSchema),
  asyncHandler(adminStudentController.changeStudentStatus),
);

export default router;
