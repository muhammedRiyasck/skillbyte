import { Router } from 'express';
import { paymentController, withdrawalController } from './PaymentContainer';
import { authenticate } from '../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../shared/middlewares/RequireRole';
import asyncHandler from '../../../shared/utils/AsyncHandler';

const router = Router();

router.use(authenticate);

// PayPal capture route
router.post(
  '/capture-paypal',
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

router.post('/withdrawals/request', (req, res) => {
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
  (req, res) => {
    withdrawalController.processWithdrawal(req, res);
  },
);

router.post(
  '/withdrawals/:withdrawalId/reject',
  authenticate,
  requireRole('admin'),
  (req, res) => {
    withdrawalController.rejectWithdrawal(req, res);
  },
);

export default router;
