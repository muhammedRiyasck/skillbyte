import { CreatePaymentIntentUseCase } from '../application/use-cases/CreatePaymentIntentUseCase';
import { HandleStripeWebhookUseCase } from '../application/use-cases/HandleStripeWebhookUseCase';
import { CheckEnrollmentUseCase } from '../application/use-cases/CheckEnrollmentUseCase';
import { EnrollmentRepository } from '../infrastructure/repositories/EnrollmentRepository';
import { EnrollmentController } from './EnrollmentController';

const enrollmentRepo = new EnrollmentRepository();
const createPaymentIntentUc = new CreatePaymentIntentUseCase(enrollmentRepo);
const handleStripeWebhookUc = new HandleStripeWebhookUseCase(enrollmentRepo);
const checkEnrollmentUc = new CheckEnrollmentUseCase(enrollmentRepo);

export const enrollmentController = new EnrollmentController(
  createPaymentIntentUc,
  handleStripeWebhookUc,
  checkEnrollmentUc,
);
