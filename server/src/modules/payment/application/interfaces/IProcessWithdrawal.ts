export interface IProcessWithdrawal {
  execute(withdrawalId: string, adminNotes?: string): Promise<void>;
}
