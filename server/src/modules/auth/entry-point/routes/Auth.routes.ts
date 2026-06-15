import { Router } from 'express';
const router = Router();

import { GoogleController } from '../controllers/Google.controller';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { commonAuthController } from '../dependencyInjection/CommonAuthContainer';
import { facebookController } from '../controllers/Facebook.controller';

import { CustomLimit } from '../../../../shared/utils/RateLimiter';
import asyncHandler from '../../../../shared/utils/AsyncHandler';
import { requireRole } from '../../../../shared/middlewares/RequireRole';
import { validateRequest } from '../../../../shared/middlewares/validateRequest';
import { LoginSchema } from '../validations/LoginValidation';
import { ResendOtpSchema } from '../validations/ResendOtpValidation';
import { ForgotPasswordSchema } from '../validations/ForgotPasswordValidation';
import { ResetPasswordSchema } from '../validations/ResetPasswordValidation';

// Authentication routes
router.post(
  '/login',
  CustomLimit(10, 'login'),
  validateRequest(LoginSchema),
  requireRole('student', 'instructor'),
  asyncHandler(commonAuthController.login),
);
router.get('/me', authenticate, asyncHandler(commonAuthController.amILoggedIn));

// OAuth routes
router.get('/google', GoogleController.googleAuth);
router.get('/google/callback', GoogleController.googleCallback);
router.get('/facebook', facebookController.facebookAuth);
router.get('/facebook/callback', facebookController.facebookCallback);

// Token and password management routes
router.get('/refresh-token', commonAuthController.refreshToken);
router.post(
  '/resend-otp',
  CustomLimit(10, 'resend OTP'),
  validateRequest(ResendOtpSchema),
  asyncHandler(commonAuthController.resendOtp),
);
router.post(
  '/forgot-password',
  CustomLimit(10, 'forgot password'),
  validateRequest(ForgotPasswordSchema),
  asyncHandler(commonAuthController.forgotPassword),
);
router.post(
  '/reset-password',
  CustomLimit(10, 'reset password'),
  validateRequest(ResetPasswordSchema),
  asyncHandler(commonAuthController.resetPassword),
);
router.post('/logout', commonAuthController.logout);

export default router;
