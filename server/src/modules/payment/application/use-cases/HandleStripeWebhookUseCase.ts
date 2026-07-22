import Stripe from 'stripe';
import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import logger from '../../../../shared/utils/Logger';
import { IStripeProvider } from '../../../../shared/services/payment/interfaces/IStripeProvider';
import { eventBus } from '../../../../shared/services/event-bus/EventBus';
import {
  PAYMENT_EVENTS,
  PaymentSucceededEvent,
  PaymentFailedEvent,
} from '../../../../shared/services/event-bus/PaymentEvents';
import { IHandleStripeWebhook } from '../interfaces/IHandleStripeWebhook';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { IWithdrawalRepository } from '../../domain/IRepositories/IWithdrawalRepository';
import { IInstructorRepository } from '../../../instructor/domain/IRepositories/IInstructorRepository';
import { WithdrawalStatus } from '../../domain/entities/Withdrawal';
import { WITHDRAWAL_EVENTS } from '../../../../shared/services/event-bus/WithdrawalEvents';

export class HandleStripeWebhookUseCase implements IHandleStripeWebhook {
  constructor(
    private _paymentRepository: IPaymentWriteRepository,
    private _stripeProvider: IStripeProvider,
    private _withdrawalRepository: IWithdrawalRepository,
    private _instructorRepository: IInstructorRepository,
  ) {}

  async execute(signature: string, payload: Buffer): Promise<void> {
    let event: Stripe.Event;

    try {
      event = this._stripeProvider.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Webhook signature verification failed: ${message}`);
      throw new HttpError(
        `Webhook Error: ${message}`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    logger.info(`STRIPE EVENT RECEIVED: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentSuccess(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(paymentIntent);
        break;
      }
      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        await this.handlePayoutFailure(payout);
        break;
      }
      case 'transfer.reversed': {
        const transfer = event.data.object as Stripe.Transfer;
        await this.handleTransferReversal(transfer);
        break;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await this.handleAccountUpdated(account);
        break;
      }
      default:
        logger.info(`Unhandled event type ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // 1. Update Payment Status to succeeded
    const payment = await this._paymentRepository.updatePaymentStatus(
      paymentIntent.id,
      'succeeded',
    );

    if (!payment) {
      logger.error('Payment record not found for intent', paymentIntent.id);
      return;
    }

    // 2. Emit event for other modules to handle
    const paymentEvent: PaymentSucceededEvent = {
      paymentId: payment.paymentId!,
      userId: payment.userId,
      courseId: payment.courseId,
      mentorshipBookingId: payment.mentorshipBookingId,
      amount: payment.amount,
      currency: payment.currency,
      instructorId: payment.instructorId,
      instructorAmount: payment.instructorAmount,
      metadata: payment.metadata,
    };

    logger.info(
      `Emitting payment.succeeded event for payment ${payment.paymentId}`,
    );
    eventBus.emit(PAYMENT_EVENTS.PAYMENT_SUCCEEDED, paymentEvent);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const payment = await this._paymentRepository.updatePaymentStatus(
      paymentIntent.id,
      'failed',
    );

    if (payment) {
      const failedEvent: PaymentFailedEvent = {
        paymentId: payment.paymentId!,
        userId: payment.userId,
        reason: 'Payment failed',
      };

      eventBus.emit(PAYMENT_EVENTS.PAYMENT_FAILED, failedEvent);
    }
  }

  private async handlePayoutFailure(payout: Stripe.Payout) {
    // If it's a connect account payout failure, the transfer ID isn't directly here
    // but the account ID is. For Connect, we usually look for any processing withdrawal for this account.
    // However, if we store the Transfer ID in transactionId, we should look for that.
    // Payout failure happens on the destination account side.
    logger.error(
      `Stripe payout failed: ${payout.id} for account ${payout.destination}`,
    );
    // Reconciliation logic would go here if we were tracking bank payouts specifically.
  }

  private async handleTransferReversal(transfer: Stripe.Transfer) {
    const withdrawal = await this._withdrawalRepository.findByTransactionId(
      transfer.id,
    );

    if (!withdrawal) {
      logger.warn(
        `Withdrawal record not found for reversed transfer: ${transfer.id}`,
      );
      return;
    }

    if (withdrawal.status === WithdrawalStatus.FAILED) {
      logger.info(
        `Withdrawal ${withdrawal.withdrawalId} is already marked as FAILED`,
      );
      return;
    }

    // 1. Update Withdrawal Status
    await this._withdrawalRepository.updateStatus(
      withdrawal.withdrawalId!,
      WithdrawalStatus.FAILED,
      undefined,
      'Stripe transfer was reversed.',
    );

    // 2. Recover Instructor Balance (only if it was marked as completed/withdrawn)
    if (withdrawal.status === WithdrawalStatus.COMPLETED) {
      await this._instructorRepository.decrementWithdrawnAmount(
        withdrawal.instructorId.toString(),
        withdrawal.amount,
      );
    }

    // 3. Emit event for dashboard/notification
    eventBus.emit(WITHDRAWAL_EVENTS.WITHDRAWAL_FAILED, {
      withdrawalId: withdrawal.withdrawalId!,
      instructorId: withdrawal.instructorId.toString(),
      amount: withdrawal.amount,
      currency: withdrawal.currency,
      status: WithdrawalStatus.FAILED,
      adminNotes: 'Transfer reversed at Stripe.',
    });

    logger.info(
      `Reversed withdrawal ${withdrawal.withdrawalId} and recovered balance.`,
    );
  }

  private async handleAccountUpdated(account: Stripe.Account) {
    const instructor = await this._instructorRepository.findByStripeAccountId(
      account.id,
    );

    if (!instructor) {
      logger.warn(
        `Stripe account ${account.id} updated, but no matching instructor found in DB.`,
      );
      return;
    }

    const isVerified = account.payouts_enabled;
    logger.info(
      `Instructor ${instructor.instructorId} (${instructor.name}) - payouts_enabled: ${isVerified}`,
    );

    // Only update if status changed
    if (instructor.isStripeVerified !== isVerified) {
      await this._instructorRepository.updateStripeVerificationStatus(
        instructor.instructorId!,
        isVerified,
      );

      if (isVerified) {
        logger.info(
          `Stripe account ${account.id} verified for instructor ${instructor.instructorId!}`,
        );
        eventBus.emit(WITHDRAWAL_EVENTS.INSTRUCTOR_STRIPE_VERIFIED, {
          instructorId: instructor.instructorId!,
        });
      } else {
        logger.warn(
          `Stripe account ${account.id} restricted for instructor ${instructor.instructorId!}`,
        );
        eventBus.emit(WITHDRAWAL_EVENTS.INSTRUCTOR_STRIPE_RESTRICTED, {
          instructorId: instructor.instructorId!,
        });
      }
    }
  }
}
