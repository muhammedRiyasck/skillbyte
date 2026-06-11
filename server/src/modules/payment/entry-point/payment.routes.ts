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
router.get('/earnings', (req, res) => {
  paymentController.getInstructorEarnings(req, res);
});

// Withdrawal routes

// Instructor routes for withdrawals
router.get('/withdrawals/my', (req, res) => {
  withdrawalController.getMyWithdrawals(req, res);
});

router.post('/withdrawals/request', validateRequest(RequestWithdrawalSchema), (req, res) => {
  withdrawalController.requestWithdrawal(req, res);
});

// Admin routes for withdrawals
router.get(
  '/withdrawals/all',
  authenticate,
  requireRole('admin'),
  (req, res) => {
    withdrawalController.getAllWithdrawals(req, res);
  },
);

router.post(
  '/withdrawals/:withdrawalId/process',
  authenticate,
  requireRole('admin'),
  validateRequest(ProcessWithdrawalSchema),
  (req, res) => {
    withdrawalController.processWithdrawal(req, res);
  },
);

router.post(
  '/withdrawals/:withdrawalId/reject',
  authenticate,
  requireRole('admin'),
  validateRequest(RejectWithdrawalSchema),
  (req, res) => {
    withdrawalController.rejectWithdrawal(req, res);
  },
);

export default router;
