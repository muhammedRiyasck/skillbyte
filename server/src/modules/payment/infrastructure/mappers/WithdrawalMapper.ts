import { IWithdrawal } from '../../domain/entities/Withdrawal';
import { IWithdrawalDocument } from '../models/WithdrawalModel';

/** Handles withdrawal mapper functionality. */
export class WithdrawalMapper {
  /**
   * To entity for the WithdrawalMapper entity.
   *
   * @param doc - The doc information.
   * @returns The result of the operation.
   */
  static toEntity(doc: IWithdrawalDocument): IWithdrawal {
    return {
      withdrawalId: (doc._id as { toString(): string }).toString(),
      instructorId: doc.instructorId?.toString(),
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
      payoutMethod: doc.payoutMethod,
      payoutDetails: doc.payoutDetails,
      transactionId: doc.transactionId,
      notes: doc.notes,
      adminNotes: doc.adminNotes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
