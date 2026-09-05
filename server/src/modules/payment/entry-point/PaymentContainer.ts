import { PaymentReadRepository } from '../infrastructure/repositories/PaymentReadRepository';
import { PaymentWriteRepository } from '../infrastructure/repositories/PaymentWriteRepository';
import { GetUserPurchasesUseCase } from '../application/use-cases/GetUserPurchasesUseCase';
import { GetInstructorEarningsUseCase } from '../application/use-cases/GetInstructorEarningsUseCase';
import { HandleStripeWebhookUseCase } from '../application/use-cases/HandleStripeWebhookUseCase';
import { CapturePayPalPaymentUseCase } from '../application/use-cases/CapturePayPalPaymentUseCase';
import { InitiatePaymentUseCase } from '../application/use-cases/InitiatePaymentUseCase';
import { PaymentController } from './controller/PaymentController';
import { PaymentWebhookController } from './controller/PaymentWebhookController';
import { InstructorEarningsController } from './controller/InstructorEarningsController';
import { StripeProvider } from '../../../shared/services/payment/StripeProvider';
import { PayPalProvider } from '../../../shared/services/payment/PayPalProvider';
import { PaymentProviderFactory } from '../../../shared/services/payment/PaymentProviderFactory';
import { InstructorRepository } from '../../instructor/infrastructure/repositories/InstructorRepository';

import { WithdrawalRepository } from '../infrastructure/repositories/WithdrawalRepository';
import { RequestWithdrawalUseCase } from '../application/use-cases/RequestWithdrawalUseCase';
import { ProcessWithdrawalUseCase } from '../application/use-cases/ProcessWithdrawalUseCase';
import { RejectWithdrawalUseCase } from '../application/use-cases/RejectWithdrawalUseCase';
import { RefundPaymentUseCase } from '../application/use-cases/RefundPaymentUseCase';
import { WithdrawalController } from './controller/WithdrawalController';

import { StripeWebhookRegistry } from '../application/strategies/webhook/StripeWebhookRegistry';
import { PaymentIntentSucceededHandler } from '../application/strategies/webhook/PaymentIntentSucceededHandler';
import { PaymentIntentFailedHandler } from '../application/strategies/webhook/PaymentIntentFailedHandler';
import { PayoutFailedHandler } from '../application/strategies/webhook/PayoutFailedHandler';
import { TransferReversedHandler } from '../application/strategies/webhook/TransferReversedHandler';
import { StripeAccountUpdatedHandler } from '../application/strategies/webhook/StripeAccountUpdatedHandler';

const paymentReadRepo = new PaymentReadRepository();
const paymentWriteRepo = new PaymentWriteRepository();
const instructorRepo = new InstructorRepository();
const withdrawalRepo = new WithdrawalRepository();
const stripeProvider = new StripeProvider();
const paypalProvider = new PayPalProvider();
const paymentProviderFactory = new PaymentProviderFactory();
paymentProviderFactory.registerProvider('stripe', stripeProvider);
paymentProviderFactory.registerProvider('paypal', paypalProvider);

const stripeWebhookRegistry = new StripeWebhookRegistry();
stripeWebhookRegistry.register(
  new PaymentIntentSucceededHandler(paymentWriteRepo),
);
stripeWebhookRegistry.register(
  new PaymentIntentFailedHandler(paymentWriteRepo),
);
stripeWebhookRegistry.register(new PayoutFailedHandler());
stripeWebhookRegistry.register(
  new TransferReversedHandler(withdrawalRepo, instructorRepo),
);
stripeWebhookRegistry.register(new StripeAccountUpdatedHandler(instructorRepo));

const getUserPurchasesUc = new GetUserPurchasesUseCase(paymentReadRepo);
const getInstructorEarningsUc = new GetInstructorEarningsUseCase(
  paymentReadRepo,
);

const handleStripeWebhookUc = new HandleStripeWebhookUseCase(
  stripeProvider,
  stripeWebhookRegistry,
);
const capturePayPalPaymentUc = new CapturePayPalPaymentUseCase(
  paymentWriteRepo,
  paypalProvider,
);
const initiatePaymentUc = new InitiatePaymentUseCase(
  paymentWriteRepo,
  paymentReadRepo,
  paymentProviderFactory,
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

const refundPaymentUc = new RefundPaymentUseCase(
  paymentReadRepo,
  paymentWriteRepo,
  stripeProvider,
  paypalProvider,
);

export { initiatePaymentUc, refundPaymentUc };

export const withdrawalController = new WithdrawalController(
  requestWithdrawalUc,
  processWithdrawalUc,
  rejectWithdrawalUc,
  withdrawalRepo,
);

// ── Focused SRP Controllers ────────────────────────────────────────────────────

/** Handles student purchase history. */
export const paymentController = new PaymentController(getUserPurchasesUc);

/** Handles Stripe webhook ingress and PayPal capture. */
export const paymentWebhookController = new PaymentWebhookController(
  handleStripeWebhookUc,
  capturePayPalPaymentUc,
);

/** Handles instructor earnings and payout analytics. */
export const instructorEarningsController = new InstructorEarningsController(
  getInstructorEarningsUc,
);
