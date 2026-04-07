export interface IRequestWithdrawal {
  execute(instructorId: string, amount: number): Promise<void>;
}
