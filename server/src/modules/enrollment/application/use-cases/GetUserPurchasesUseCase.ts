import { IEnrollmentRepository } from '../../domain/IEnrollmentRepository';
import { IPaymentHistory } from '../../types/IPaymentHistory';
import { IGetUserPurchases } from '../interfaces/IGetUserPurchases';

export class GetUserPurchasesUseCase implements IGetUserPurchases {
  constructor(private enrollmentRepository: IEnrollmentRepository) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IPaymentHistory[]> {
    return await this.enrollmentRepository.findPaymentsByUser(
      userId,
      page,
      limit,
    );
  }
}
