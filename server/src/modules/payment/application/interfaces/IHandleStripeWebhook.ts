export interface IHandleStripeWebhook {
  execute(signature: string, payload: Buffer): Promise<void>;
}
