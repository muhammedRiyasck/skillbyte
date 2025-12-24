import { HandleStripeWebhookUseCase } from '../application/use-cases/HandleStripeWebhookUseCase';
import { CheckEnrollmentUseCase } from '../application/use-cases/CheckEnrollmentUseCase';
import { GetInstructorEnrollmentsUseCase } from '../application/use-cases/GetInstructorEnrollmentsUseCase';
import { EnrollmentRepository } from '../infrastructure/repositories/EnrollmentRepository';
import { EnrollmentController } from './EnrollmentController';
import { UpdateLessonProgress } from '../application/use-cases/UpdateLessonProgress';
import { GetUserPurchasesUseCase } from '../application/use-cases/GetUserPurchasesUseCase';
import { GetInstructorEarningsUseCase } from '../application/use-cases/GetInstructorEarningsUseCase';
import { InitiateEnrollmentPaymentUseCase } from '../application/use-cases/InitiateEnrollmentPaymentUseCase';
import { CapturePayPalPaymentUseCase } from '../application/use-cases/CapturePayPalPaymentUseCase';
import { StripeProvider } from '../../../shared/services/StripeProvider';
import { PayPalProvider } from '../../../shared/services/PayPalProvider';
import { PaymentProviderFactory } from '../../../shared/services/PaymentProviderFactory';

const enrollmentRepo = new EnrollmentRepository();
const stripeProvider = new StripeProvider();
const paypalProvider = new PayPalProvider();

const paymentProviderFactory = new PaymentProviderFactory();
paymentProviderFactory.registerProvider('stripe', stripeProvider);
paymentProviderFactory.registerProvider('paypal', paypalProvider);

const initiatePaymentUc = new InitiateEnrollmentPaymentUseCase(
  enrollmentRepo,
  paymentProviderFactory,
);
const handleStripeWebhookUc = new HandleStripeWebhookUseCase(
  enrollmentRepo,
  stripeProvider,
);
const checkEnrollmentUc = new CheckEnrollmentUseCase(enrollmentRepo);
const getInstructorEnrollmentsUc = new GetInstructorEnrollmentsUseCase(
  enrollmentRepo,
);
const updateLessonProgressUc = new UpdateLessonProgress(enrollmentRepo);
const getUserPurchasesUc = new GetUserPurchasesUseCase(enrollmentRepo);
const getInstructorEarningsUc = new GetInstructorEarningsUseCase(
  enrollmentRepo,
);
const capturePayPalPaymentUc = new CapturePayPalPaymentUseCase(
  enrollmentRepo,
  paypalProvider,
);

export const enrollmentController = new EnrollmentController(
  initiatePaymentUc,
  handleStripeWebhookUc,
  checkEnrollmentUc,
  getInstructorEnrollmentsUc,
  updateLessonProgressUc,
  getUserPurchasesUc,
  getInstructorEarningsUc,
  capturePayPalPaymentUc,
);
