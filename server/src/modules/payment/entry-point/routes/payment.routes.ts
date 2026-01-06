import { Router } from 'express';
import { paymentController } from '../PaymentContainer';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';

const router = Router();

// Webhook route (no auth needed - validated by Stripe signature)
router.post('/stripe-webhook', async (req, res) => {
  await paymentController.handleStripeWebhook(req, res);
});

// PayPal capture route
router.post('/capture-paypal', authenticate, async (req, res) => {
  await paymentController.capturePayPalPayment(req, res);
});

// Student routes
router.get('/purchases', authenticate, (req, res) => {
  paymentController.getUserPurchases(req, res);
});

// Instructor routes
router.get('/earnings', authenticate, (req, res) => {
  paymentController.getInstructorEarnings(req, res);
});

export default router;
