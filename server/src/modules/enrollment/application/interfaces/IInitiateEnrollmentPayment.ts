import { InitiatedPaymentResponseDto } from '../dtos/InitiatedPaymentResponseDto';

export interface IInitiateEnrollmentPayment {
  execute(
    userId: string,
    courseId: string,
    providerName: string,
  ): Promise<InitiatedPaymentResponseDto>;
}
