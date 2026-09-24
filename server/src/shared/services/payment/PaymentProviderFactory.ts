import { IPaymentProvider } from './interfaces/IPaymentProvider';
import { HttpError } from '../../types/HttpError';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';

/** Handles payment provider factory functionality. */
export class PaymentProviderFactory {
  private providers: Map<string, IPaymentProvider> = new Map();

  /**
   * Register provider for the PaymentProviderFactory entity.
   *
   * @param name - The name information.
   * @param provider - The unique identifier for the provider.
   */
  registerProvider(name: string, provider: IPaymentProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  /**
   * Get provider for the PaymentProviderFactory entity.
   *
   * @param name - The name information.
   * @returns The result of the operation.
   */
  getProvider(name: string): IPaymentProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new HttpError(
        `Payment provider '${name}' not supported.`,
        HttpStatusCode.BAD_REQUEST,
      );
    }
    return provider;
  }
}
