export interface ICreateStripeOnboardingLinkUseCase {
  execute(instructorId: string): Promise<string>;
}
