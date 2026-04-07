export interface ISyncStripeAccountStatusUseCase {
  execute(instructorId: string): Promise<boolean>;
}
