import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { CustomLimit } from '../../../../shared/utils/RateLimiter';
import { adminAuthContainer } from '../dependencyInjection/AdminAuthContainer';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import { LoginAdminSchema } from '../validations/AdminAuthValidation';
import { Router } from 'express';
const router = Router();

router.post(
  '/login',
  CustomLimit(10, 'login'),
  validateRequest(LoginAdminSchema),
  asyncHandler(adminAuthContainer.login),
);

export default router;
