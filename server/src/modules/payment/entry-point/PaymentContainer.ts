import { PaymentReadRepository } from '../infrastructure/repositories/PaymentReadRepository';
import { PaymentWriteRepository } from '../infrastructure/repositories/PaymentWriteRepository';
import { GetUserPurchasesUseCase } from '../application/use-cases/GetUserPurchasesUseCase';
import { GetInstructorEarningsUseCase } from '../application/use-cases/GetInstructorEarningsUseCase';
import { HandleStripeWebhookUseCase } from '../application/use-cases/HandleStripeWebhookUseCase';
import { CapturePayPalPaymentUseCase } from '../application/use-cases/CapturePayPalPaymentUseCase';
import { InitiatePaymentUseCase } from '../application/use-cases/InitiatePaymentUseCase';
import { PaymentController } from './controller/PaymentController';
import { StripeProvider } from '../../../shared/services/payment/StripeProvider';
import { PayPalProvider } from '../../../shared/services/payment/PayPalProvider';
import { PaymentProviderFactory } from '../../../shared/services/payment/PaymentProviderFactory';
import { InstructorRepository } from '../../instructor/infrastructure/repositories/InstructorRepository';

import { WithdrawalRepository } from '../infrastructure/repositories/WithdrawalRepository';
import { RequestWithdrawalUseCase } from '../application/use-cases/RequestWithdrawalUseCase';
import { ProcessWithdrawalUseCase } from '../application/use-cases/ProcessWithdrawalUseCase';
import { RejectWithdrawalUseCase } from '../application/use-cases/RejectWithdrawalUseCase';
import { WithdrawalController } from './controller/WithdrawalController';

const paymentReadRepo = new PaymentReadRepository();
const paymentWriteRepo = new PaymentWriteRepository();
const instructorRepo = new InstructorRepository();
const withdrawalRepo = new WithdrawalRepository();
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
  withdrawalRepo,
  instructorRepo,
);
const capturePayPalPaymentUc = new CapturePayPalPaymentUseCase(
  paymentWriteRepo,
  paypalProvider,
);
const initiatePaymentUc = new InitiatePaymentUseCase(
  paymentWriteRepo,
  paymentProviderFactory,
  instructorRepo,
);

const requestWithdrawalUc = new RequestWithdrawalUseCase(
  withdrawalRepo,
  instructorRepo,
);
const processWithdrawalUc = new ProcessWithdrawalUseCase(
  withdrawalRepo,
  instructorRepo,
  paymentProviderFactory,
);
const rejectWithdrawalUc = new RejectWithdrawalUseCase(withdrawalRepo);

export { initiatePaymentUc };

export const withdrawalController = new WithdrawalController(
  requestWithdrawalUc,
  processWithdrawalUc,
  rejectWithdrawalUc,
  withdrawalRepo,
);

export const paymentController = new PaymentController(
  getUserPurchasesUc,
  getInstructorEarningsUc,
  handleStripeWebhookUc,
  capturePayPalPaymentUc,
);
