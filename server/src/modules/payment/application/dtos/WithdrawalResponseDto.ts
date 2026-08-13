import { IInstructor } from '../../../instructor/infrastructure/models/InstructorModel';
import { WithdrawalStatus } from '../../domain/entities/Withdrawal';

export interface WithdrawalResponseDto {
  _id: string; // Used by frontend as primary key
  withdrawalId: string;
  instructorId: IInstructor | string; // Allow populated object or string id
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  payoutMethod: 'STRIPE';
  payoutDetails?: string;
  adminNotes?: string;
  transactionId?: string;
  createdAt?: Date;
}
