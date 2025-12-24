import express from 'express';
import { enrollmentController } from '../EnrollmentContiner';
import { authenticate } from '../../../../shared/middlewares/AuthMiddleware';
import { requireRole } from '../../../../shared/middlewares/RequireRole';

const router = express.Router();

// Initiate Payment - Protected Route (Consolidated for OCP)
router.post('/initiate-payment', authenticate, async (req, res) => {
  await enrollmentController.initiatePayment(req, res);
});

// PayPal Payment Capture - Protected Route
router.post('/capture-paypal-payment', authenticate, async (req, res) => {
  await enrollmentController.capturePayPalPayment(req, res);
});

// Webhook for Stripe - Raw body is handled at the app level
router.post('/webhook', async (req, res) => {
  await enrollmentController.handleWebhook(req, res);
});

// Check Enrollment Status - Protected Route
router.get('/check/:courseId', authenticate, async (req, res) => {
  await enrollmentController.checkEnrollmentStatus(req, res);
});

// Get Student Purchase History - Protected Route
router.get('/purchases', authenticate, async (req, res) => {
  await enrollmentController.getUserPurchases(req, res);
});

router.get(
  '/instructor-enrollments',
  authenticate,
  requireRole('instructor'),
  async (req, res) => {
    await enrollmentController.getInstructorEnrollments(req, res);
  },
);

// Get Instructor Earnings History - Protected Route
router.get(
  '/earnings',
  authenticate,
  requireRole('instructor'),
  async (req, res) => {
    await enrollmentController.getInstructorEarnings(req, res);
  },
);

// Update Lesson Progress - Protected Route
router.patch(
  '/:enrollmentId/lesson-progress',
  authenticate,
  async (req, res) => {
    await enrollmentController.updateProgress(req, res);
  },
);

export default router;
