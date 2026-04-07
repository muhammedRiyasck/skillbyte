import {
  IWithdrawalDocument,
  WithdrawalStatus,
} from '../../infrastructure/models/WithdrawalModel';

export interface IWithdrawalRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  save(withdrawal: any): Promise<IWithdrawalDocument>;
  findById(id: string): Promise<IWithdrawalDocument | null>;
  findByTransactionId(
    transactionId: string,
  ): Promise<IWithdrawalDocument | null>;
  updateStatus(
    id: string,
    status: WithdrawalStatus,
    transactionId?: string,
    adminNotes?: string,
  ): Promise<void>;
  findByTransactionId(
    transactionId: string,
  ): Promise<IWithdrawalDocument | null>;
  updateStatusWithCondition(
    id: string,
    newStatus: WithdrawalStatus,
    currentStatus: WithdrawalStatus,
    transactionId?: string,
    adminNotes?: string,
  ): Promise<IWithdrawalDocument | null>;
  findAll(
    filter?: Record<string, unknown>,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ data: IWithdrawalDocument[]; total: number }>;
  findByInstructorId(
    instructorId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: IWithdrawalDocument[]; total: number }>;
  hasPendingWithdrawal(instructorId: string): Promise<boolean>;
}
