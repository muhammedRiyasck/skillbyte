import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { InitiatePaymentRequest } from '../dtos/InitiatePaymentDto';

export interface IInitiatePayment {
  execute(request: InitiatePaymentRequest): Promise<{
    providerResponse: PaymentInitiationResponse;
    paymentId: string;
  }>;
}
