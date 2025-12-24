import { IPaymentProvider } from '../../modules/enrollment/application/interfaces/IPaymentProvider';

export class PaymentProviderFactory {
  private providers: Map<string, IPaymentProvider> = new Map();

  registerProvider(name: string, provider: IPaymentProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  getProvider(name: string): IPaymentProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new Error(`Payment provider '${name}' not supported.`);
    }
    return provider;
  }
}
