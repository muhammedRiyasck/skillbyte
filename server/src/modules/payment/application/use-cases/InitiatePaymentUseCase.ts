import { IPaymentWriteRepository } from '../../domain/IRepositories/IPaymentWriteRepository';
import { PaymentProviderFactory } from '../../../../shared/services/payment/PaymentProviderFactory';
import { IPayment } from '../../domain/entities/Payment';
import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { InitiatePaymentRequest } from '../dtos/InitiatePaymentDto';
import { IInitiatePayment } from '../interfaces/IInitiatePayment';

export class InitiatePaymentUseCase implements IInitiatePayment {
  constructor(
    private paymentRepo: IPaymentWriteRepository,
    private paymentProviderFactory: PaymentProviderFactory,
  ) {}

  async execute(request: InitiatePaymentRequest): Promise<{
    providerResponse: PaymentInitiationResponse;
    paymentId: string;
  }> {
    const {
      userId,
      courseId,
      instructorId,
      amount,
      currency,
      providerName,
      productName,
      productImage,
      studentName,
      studentEmail,
    } = request;

    // 1. Get provider from factory
    const provider = this.paymentProviderFactory.getProvider(providerName);

    // 2. Handle currency conversion for PayPal (assuming Course price is in INR)
    const isPayPal = providerName.toLowerCase() === 'paypal';
    let amountToCharge = amount;
    let convertedAmount: number | undefined;
    let chargeCurrency = currency;

    if (isPayPal && currency === 'INR') {
      const exchangeRate = 83; // 1 USD = 83 INR (Fixed rate for simplicity)
      convertedAmount = Math.round((amount / exchangeRate) * 100) / 100;
      amountToCharge = convertedAmount;
      chargeCurrency = 'USD';
    }

    // 3. Initiate payment with provider
    const providerResponse = await provider.initiate(
      amountToCharge,
      chargeCurrency,
      {
        userId,
        courseId,
      },
    );

    // 4. Calculate fees
    const adminFee = amount * 0.2; // 20% platform fee
    const instructorAmount = amount - adminFee;

    // 5. Create local payment record (Pending)
    const paymentData: Partial<IPayment> = {
      userId,
      courseId,
      instructorId,
      amount,
      currency: 'INR', // Base currency is INR
      status: 'pending',
      adminFee,
      instructorAmount,
      productName,
      productImage,
      studentName,
      studentEmail,
      convertedAmount,
      convertedCurrency: convertedAmount ? 'USD' : undefined,
    };

    // Handle provider-specific IDs
    if (providerName.toLowerCase() === 'stripe') {
      paymentData.stripePaymentIntentId = providerResponse.id;
    } else if (providerName.toLowerCase() === 'paypal') {
      paymentData.paypalOrderId = providerResponse.id;
    }

    const payment = await this.paymentRepo.createPayment(paymentData);

    return {
      providerResponse,
      paymentId: payment.paymentId!,
    };
  }
}
