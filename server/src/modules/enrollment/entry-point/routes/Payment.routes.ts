import express from 'express';
import { paymentController } from '../EnrollmentContiner';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';

const router = express.Router();

// Initiate Payment - Protected Route (Consolidated for OCP)
router.post('/initiate-payment', authenticate, async (req, res) => {
  await paymentController.initiatePayment(req, res);
});

// PayPal Payment Capture - Protected Route
router.post('/capture-paypal-payment', authenticate, async (req, res) => {
  await paymentController.capturePayPalPayment(req, res);
});



// Get Student Purchase History - Protected Route
router.get('/purchases', authenticate, async (req, res) => {
  await paymentController.getUserPurchases(req, res);
});

// Get Instructor Earnings History - Protected Route
router.get(
  '/earnings',
  authenticate,
  requireRole('instructor'),
  async (req, res) => {
    await paymentController.getInstructorEarnings(req, res);
  },
);

export default router;
