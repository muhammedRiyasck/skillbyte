import {
  IPayPalProvider,
  PayPalCaptureResponse,
} from './interfaces/IPayPalProvider';
import {
  IPaymentProvider,
  PaymentInitiationResponse,
} from './interfaces/IPaymentProvider';
import logger from '../../utils/Logger';

interface PayPalLink {
  href: string;
  rel: string;
  method?: string;
}

interface PayPalOrderResponse {
  id: string;
  links: PayPalLink[];
}

export class PayPalProvider implements IPayPalProvider, IPaymentProvider {
  private clientId = process.env.PAYPAL_CLIENT_ID;
  private clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  private baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal credentials are not configured.');
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      logger.error('PayPal Auth Error:', errorData);
      throw new Error('Failed to authenticate with PayPal');
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  async initiate(
    amount: number,
    currency: string,
    // metadata: { userId: string; courseId: string },
  ): Promise<PaymentInitiationResponse> {
    const order = await this.createOrder(amount, currency);
    return { id: order.id };
  }

  async createOrder(
    amount: number,
    currency: string = 'USD',
  ): Promise<PayPalOrderResponse> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('PayPal Create Order Error:', errorData);
      throw new Error('Failed to create PayPal order');
    }

    return response.json() as Promise<{ id: string; links: PayPalLink[] }>;
  }

  async capturePayment(orderId: string): Promise<PayPalCaptureResponse> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('PayPal Capture Payment Error:', errorData);
      throw new Error('Failed to capture PayPal payment');
    }

    return response.json() as Promise<PayPalCaptureResponse>;
  }
}
