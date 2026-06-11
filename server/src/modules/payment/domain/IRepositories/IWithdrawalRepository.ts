import {
  IWithdrawal,
  WithdrawalStatus,
} from '../entities/Withdrawal';

export interface IWithdrawalRepository {
  save(withdrawal: Partial<IWithdrawal>): Promise<IWithdrawal>;
  findById(id: string): Promise<IWithdrawal | null>;
  findByTransactionId(
    transactionId: string,
  ): Promise<IWithdrawal | null>;
  updateStatus(
    id: string,
    status: WithdrawalStatus,
    transactionId?: string,
    adminNotes?: string,
  ): Promise<void>;
  findByTransactionId(
    transactionId: string,
  ): Promise<IWithdrawal | null>;
  updateStatusWithCondition(
    id: string,
    newStatus: WithdrawalStatus,
    currentStatus: WithdrawalStatus,
    transactionId?: string,
    adminNotes?: string,
  ): Promise<IWithdrawal | null>;
  findAll(
    filter?: Record<string, unknown>,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ data: IWithdrawal[]; total: number }>;
  findByInstructorId(
    instructorId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: IWithdrawal[]; total: number }>;
  hasPendingWithdrawal(instructorId: string): Promise<boolean>;
}
