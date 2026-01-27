import { IPaymentProvider } from './interfaces/IPaymentProvider';
import { HttpError } from '../../types/HttpError';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';

export class PaymentProviderFactory {
  private providers: Map<string, IPaymentProvider> = new Map();

  registerProvider(name: string, provider: IPaymentProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

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
