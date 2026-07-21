import { PaymentInitiationResponse } from '../../../../shared/services/payment/interfaces/IPaymentProvider';
import { InitiatePaymentDto } from '../dtos/InitiatePaymentDto';

export interface IInitiatePayment {
  execute(request: InitiatePaymentDto): Promise<{
    providerResponse: PaymentInitiationResponse;
    paymentId: string;
  }>;
}
