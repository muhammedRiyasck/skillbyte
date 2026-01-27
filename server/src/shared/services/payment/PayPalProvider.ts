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
      ? process.env.PAYPAL_LIVE_URL
      : process.env.PAYPAL_SANDBOX_URL;

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
  ): Promise<PaymentInitiationResponse> {
    const order = await this.createOrder(amount, currency);
    const approveLink = order.links.find((link) => link.rel === 'approve');

    return {
      id: order.id,
      client_secret: approveLink?.href, // Return approval URL as client_secret for frontend redirect
    };
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
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/mentorship/bookings`,
          cancel_url: `${process.env.FRONTEND_URL}/mentorship/bookings`,
        },
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (await response.json()) as any;

    // Extract actual capture ID if nested
    const captureId =
      data.purchase_units?.[0]?.payments?.captures?.[0]?.id || data.id;
    return {
      id: captureId,
      status: data.status,
    };
  }

  async refund(captureId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
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
        logger.error('PayPal Refund Error:', errorData);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('PayPal Refund Exception:', error);
      return false;
    }
  }
}
