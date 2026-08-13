import { InitiatedPaymentResponseDto } from '../dtos/InitiatedPaymentResponseDto';

export interface IInitiateEnrollmentPaymentUseCase {
  execute(
    userId: string,
    courseId: string,
    providerName: string,
  ): Promise<InitiatedPaymentResponseDto>;
}
