import { Router } from 'express';
import {
  paymentController,
  paymentWebhookController,
  instructorEarningsController,
  withdrawalController,
} from './PaymentContainer';
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

// ── Payment Provider Routes (Webhook / Capture) ───────────────────────────────

// PayPal capture route
router.post(
  '/capture-paypal',
  validateRequest(CapturePayPalPaymentSchema),
  asyncHandler(paymentWebhookController.capturePayPalPayment),
);

// ── Student Routes ────────────────────────────────────────────────────────────

router.get('/purchases', asyncHandler(paymentController.getUserPurchases));

// ── Instructor Routes ─────────────────────────────────────────────────────────

router.get(
  '/earnings',
  asyncHandler(instructorEarningsController.getInstructorEarnings),
);

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

// ── Admin Routes ──────────────────────────────────────────────────────────────

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
