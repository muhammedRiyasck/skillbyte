import { Router } from 'express';
import { studentAuthController } from '../dependencyInjection/StudentauthContainer';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { CustomLimit } from '../../../../shared/utils/RateLimiter';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import { StudentRegistrationSchema } from '../validations/StudentRegistrationValidation';
import { StudentVerifyOtpSchema } from '../validations/StudentVerifyOtpValidation';

const router = Router();

router.post(
  '/register',
  validateRequest(StudentRegistrationSchema),
  asyncHandler(studentAuthController.registerStudent),
);

router.post(
  '/verify-otp',
  CustomLimit(10, 'verify OTP'),
  validateRequest(StudentVerifyOtpSchema),
  asyncHandler(studentAuthController.verifyOtp),
);

export default router;
