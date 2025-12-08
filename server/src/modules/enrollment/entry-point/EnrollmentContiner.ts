import { CreatePaymentIntent } from '../application/use-cases/CreatePaymentIntent';
import { HandleStripeWebhook } from '../application/use-cases/HandleStripeWebhook';
import { CheckEnrollment } from '../application/use-cases/CheckEnrollment';
import { EnrollmentRepository } from '../infrastructure/repositories/EnrollmentRepository';
import { EnrollmentController } from './EnrollmentController';

const enrollmentRepo = new EnrollmentRepository();
const createPaymentIntentUc = new CreatePaymentIntent(enrollmentRepo);
const handleStripeWebhookUc = new HandleStripeWebhook(enrollmentRepo);
const checkEnrollmentUc = new CheckEnrollment(enrollmentRepo);

export const enrollmentController = new EnrollmentController(
  createPaymentIntentUc,
  handleStripeWebhookUc,
  checkEnrollmentUc,
);
