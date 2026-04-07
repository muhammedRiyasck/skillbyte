export interface IRejectWithdrawal {
  execute(withdrawalId: string, adminNotes?: string): Promise<void>;
}
