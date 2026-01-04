import { HandleStripeWebhookUseCase } from '../application/use-cases/HandleStripeWebhookUseCase';
import { CheckEnrollmentUseCase } from '../application/use-cases/CheckEnrollmentUseCase';
import { GetInstructorEnrollmentsUseCase } from '../application/use-cases/GetInstructorEnrollmentsUseCase';
import { EnrollmentRepository } from '../infrastructure/repositories/EnrollmentRepository';
import { PaymentRepository } from '../infrastructure/repositories/PaymentRepository';
import { EnrollmentController } from './EnrollmentController';
import { PaymentController } from './PaymentController';
import { UpdateLessonProgress } from '../application/use-cases/UpdateLessonProgress';
import { GetUserPurchasesUseCase } from '../application/use-cases/GetUserPurchasesUseCase';
import { GetInstructorEarningsUseCase } from '../application/use-cases/GetInstructorEarningsUseCase';
import { InitiateEnrollmentPaymentUseCase } from '../application/use-cases/InitiateEnrollmentPaymentUseCase';
import { CapturePayPalPaymentUseCase } from '../application/use-cases/CapturePayPalPaymentUseCase';
import { GetStudentEnrollmentsUseCase } from '../application/use-cases/GetStudentEnrollmentsUseCase';

import { StripeProvider } from '../../../shared/services/payment/StripeProvider';
import { PayPalProvider } from '../../../shared/services/payment/PayPalProvider';
import { PaymentProviderFactory } from '../../../shared/services/payment/PaymentProviderFactory';

const enrollmentRepo = new EnrollmentRepository();
const paymentRepo = new PaymentRepository();
const stripeProvider = new StripeProvider();
const paypalProvider = new PayPalProvider();

const paymentProviderFactory = new PaymentProviderFactory();
paymentProviderFactory.registerProvider('stripe', stripeProvider);
paymentProviderFactory.registerProvider('paypal', paypalProvider);

const initiatePaymentUc = new InitiateEnrollmentPaymentUseCase(
  enrollmentRepo,
  paymentRepo,
  paymentProviderFactory,
);
const handleStripeWebhookUc = new HandleStripeWebhookUseCase(
  enrollmentRepo,
  paymentRepo,
  stripeProvider,
);
const checkEnrollmentUc = new CheckEnrollmentUseCase(enrollmentRepo);
const getInstructorEnrollmentsUc = new GetInstructorEnrollmentsUseCase(
  enrollmentRepo,
);
const updateLessonProgressUc = new UpdateLessonProgress(enrollmentRepo);
const getUserPurchasesUc = new GetUserPurchasesUseCase(paymentRepo);
const getInstructorEarningsUc = new GetInstructorEarningsUseCase(paymentRepo);
const capturePayPalPaymentUc = new CapturePayPalPaymentUseCase(
  enrollmentRepo,
  paymentRepo,
  paypalProvider,
);
const getStudentEnrollmentsUc = new GetStudentEnrollmentsUseCase(
  enrollmentRepo,
);

export const enrollmentController = new EnrollmentController(
  checkEnrollmentUc,
  getInstructorEnrollmentsUc,
  updateLessonProgressUc,
  getStudentEnrollmentsUc,
);

export const paymentController = new PaymentController(
  initiatePaymentUc,
  handleStripeWebhookUc,
  capturePayPalPaymentUc,
  getUserPurchasesUc,
  getInstructorEarningsUc,
);
