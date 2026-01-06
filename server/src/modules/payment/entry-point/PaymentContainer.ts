import { PaymentReadRepository } from '../infrastructure/repositories/PaymentReadRepository';
import { PaymentWriteRepository } from '../infrastructure/repositories/PaymentWriteRepository';
import { GetUserPurchasesUseCase } from '../application/use-cases/GetUserPurchasesUseCase';
import { GetInstructorEarningsUseCase } from '../application/use-cases/GetInstructorEarningsUseCase';
import { HandleStripeWebhookUseCase } from '../application/use-cases/HandleStripeWebhookUseCase';
import { CapturePayPalPaymentUseCase } from '../application/use-cases/CapturePayPalPaymentUseCase';
import { InitiatePaymentUseCase } from '../application/use-cases/InitiatePaymentUseCase';
import { PaymentController } from './PaymentController';
import { StripeProvider } from '../../../shared/services/payment/StripeProvider';
import { PayPalProvider } from '../../../shared/services/payment/PayPalProvider';
import { PaymentProviderFactory } from '../../../shared/services/payment/PaymentProviderFactory';

const paymentReadRepo = new PaymentReadRepository();
const paymentWriteRepo = new PaymentWriteRepository();
const stripeProvider = new StripeProvider();
const paypalProvider = new PayPalProvider();
const paymentProviderFactory = new PaymentProviderFactory();
paymentProviderFactory.registerProvider('stripe', stripeProvider);
paymentProviderFactory.registerProvider('paypal', paypalProvider);

const getUserPurchasesUc = new GetUserPurchasesUseCase(paymentReadRepo);
const getInstructorEarningsUc = new GetInstructorEarningsUseCase(
  paymentReadRepo,
);
const handleStripeWebhookUc = new HandleStripeWebhookUseCase(
  paymentWriteRepo,
  stripeProvider,
);
const capturePayPalPaymentUc = new CapturePayPalPaymentUseCase(
  paymentWriteRepo,
  paypalProvider,
);
const initiatePaymentUc = new InitiatePaymentUseCase(
  paymentWriteRepo,
  paymentProviderFactory,
);

export { initiatePaymentUc };

export const paymentController = new PaymentController(
  getUserPurchasesUc,
  getInstructorEarningsUc,
  handleStripeWebhookUc,
  capturePayPalPaymentUc,
);
