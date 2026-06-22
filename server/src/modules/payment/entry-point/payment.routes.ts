import { Router } from 'express';
import { paymentController, withdrawalController } from './PaymentContainer';
import { authenticate } from '../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../shared/middlewares/RequireRole';
import { validateRequest } from '../../../shared/middlewares/validateRequest';
import asyncHandler from '../../../shared/utils/AsyncHandler';
import {
  CapturePayPalPaymentSchema,
  RequestWithdrawalSchema,
  ProcessWithdrawalSchema,
  RejectWithdrawalSchema,
} from './validations/PaymentValidation';

const router = Router();

router.use(authenticate);

// PayPal capture route
router.post(
  '/capture-paypal',
  validateRequest(CapturePayPalPaymentSchema),
  asyncHandler(paymentController.capturePayPalPayment),
);

// Student routes
router.get('/purchases', asyncHandler(paymentController.getUserPurchases));

// Instructor routes
router.get('/earnings', asyncHandler(paymentController.getInstructorEarnings));

// Instructor withdrawal routes
router.get(
  '/withdrawals/my',
  asyncHandler(withdrawalController.getMyWithdrawals),
);

router.post(
  '/withdrawals/request',
  validateRequest(RequestWithdrawalSchema),
  asyncHandler(withdrawalController.requestWithdrawal),
);

// Admin withdrawal routes
router.get(
  '/withdrawals/all',
  requireRole('admin'),
  asyncHandler(withdrawalController.getAllWithdrawals),
);

router.post(
  '/withdrawals/:withdrawalId/process',
  requireRole('admin'),
  validateRequest(ProcessWithdrawalSchema),
  asyncHandler(withdrawalController.processWithdrawal),
);

router.post(
  '/withdrawals/:withdrawalId/reject',
  requireRole('admin'),
  validateRequest(RejectWithdrawalSchema),
  asyncHandler(withdrawalController.rejectWithdrawal),
);

export default router;
