import {
  IPayPalProvider,
  PayPalCaptureResponse,
} from './interfaces/IPayPalProvider';
import {
  IPaymentProvider,
  PaymentInitiationResponse,
} from './interfaces/IPaymentProvider';
import logger from '../../utils/Logger';
import { HttpError } from '../../types/HttpError';
import { HttpStatusCode } from '../../enums/HttpStatusCodes';
import { CurrencyConverter } from '../../utils/CurrencyConverter';

interface PayPalLink {
  href: string;
  rel: string;
  method?: string;
}

interface PayPalOrderResponse {
  id: string;
  links: PayPalLink[];
}

/** Handles pay pal provider functionality. */
export class PayPalProvider implements IPayPalProvider, IPaymentProvider {
  private clientId = process.env.PAYPAL_CLIENT_ID;
  private clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  private baseUrl =
    process.env.PAYPAL_MODE === 'live'
      ? process.env.PAYPAL_LIVE_URL
      : process.env.PAYPAL_SANDBOX_URL;

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new HttpError(
        'PayPal credentials are not configured.',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
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
      throw new HttpError(
        'Failed to authenticate with PayPal',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  /**
   * Initiate for the PayPalProvider entity.
   *
   * @param amount - The amount information.
   * @param currency - The currency information.
   * @param metadata - The metadata information.
   * @returns The standardized HTTP response.
   */
  async initiate(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ): Promise<PaymentInitiationResponse> {
    const returnUrl = metadata.returnUrl;
    const cancelUrl = metadata.cancelUrl;

    const order = await this.createOrder(
      amount,
      currency,
      returnUrl,
      cancelUrl,
    );
    const approveLink = order.links.find((link) => link.rel === 'approve');

    return {
      id: order.id,
      client_secret: approveLink?.href, // Return approval URL as client_secret for frontend redirect
    };
  }

  /**
   * Normalize amount for the PayPalProvider entity.
   *
   * @param amount - The amount information.
   * @param currency - The currency information.
   */
  normalizeAmount(amount: number, currency: string) {
    if (currency === 'INR') {
      const exchangeRate = CurrencyConverter.USD_TO_INR_RATE;
      const convertedAmount = Math.round((amount / exchangeRate) * 100) / 100;
      return {
        chargeAmount: convertedAmount,
        chargeCurrency: 'USD',
        convertedAmount,
        convertedCurrency: 'USD',
      };
    }
    return {
      chargeAmount: amount,
      chargeCurrency: currency,
    };
  }

  /**
   * Map provider transaction id for the PayPalProvider entity.
   *
   * @param responseId - The unique identifier for the response.
   * @returns The result of the operation.
   */
  mapProviderTransactionId(responseId: string): Record<string, string> {
    return { paypalOrderId: responseId };
  }

  /**
   * Create order for the PayPalProvider entity.
   *
   * @param amount - The amount information.
   * @param currency - The currency information.
   * @param returnUrl - The return url information.
   * @param cancelUrl - The cancel url information.
   * @returns The standardized HTTP response.
   */
  async createOrder(
    amount: number,
    currency: string = 'USD',
    returnUrl?: string,
    cancelUrl?: string,
  ): Promise<PayPalOrderResponse> {
    const accessToken = await this.getAccessToken();
    const purchaseUnit: Record<string, unknown> = {
      amount: {
        currency_code: currency,
        value: amount.toFixed(2),
      },
    };

    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [purchaseUnit],
        application_context: {
          return_url:
            returnUrl || `${process.env.FRONTEND_URL}/mentorship/bookings`,
          cancel_url:
            cancelUrl || `${process.env.FRONTEND_URL}/mentorship/bookings`,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('PayPal Create Order Error:', errorData);
      throw new HttpError(
        'Failed to create PayPal order',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    return response.json() as Promise<{ id: string; links: PayPalLink[] }>;
  }

  /**
   * Capture payment for the PayPalProvider entity.
   *
   * @param orderId - The unique identifier for the order.
   * @returns The standardized HTTP response.
   */
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
      throw new HttpError(
        'Failed to capture PayPal payment',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const data = await response.json();

    // Extract actual capture ID if nested
    const captureId =
      data.purchase_units?.[0]?.payments?.captures?.[0]?.id || data.id;
    return {
      id: captureId,
      status: data.status,
    };
  }

  /**
   * Refund for the PayPalProvider entity.
   *
   * @param captureId - The unique identifier for the capture.
   * @returns The result of the operation.
   */
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

  /**
   * Payout for the PayPalProvider entity.
   *
   * @param _amount - The _amount information.
   * @param _currency - The _currency information.
   * @param _destination - The _destination information.
   * @returns The result of the operation.
   */
  async payout(
    _amount: number,
    _currency: string,
    _destination: string,
  ): Promise<string> {
    throw new HttpError(
      'PayPal payouts are no longer supported. Please use Stripe.',
      HttpStatusCode.BAD_REQUEST,
    );
  }

  /**
   * Validate destination for the PayPalProvider entity.
   *
   * @param _destination - The _destination information.
   * @returns The result of the operation.
   */
  async validateDestination(
    _destination: string,
  ): Promise<{ isValid: boolean; reason?: string }> {
    return {
      isValid: false,
      reason: 'PayPal payouts are no longer supported.',
    };
  }

  /**
   * Validate balance for the PayPalProvider entity.
   *
   * @param _amount - The _amount information.
   * @param _currency - The _currency information.
   * @returns The result of the operation.
   */
  async validateBalance(
    _amount: number,
    _currency: string,
  ): Promise<{
    isAvailable: boolean;
    reason?: string;
    availableAmount?: number;
  }> {
    return {
      isAvailable: false,
      reason: 'PayPal payouts are no longer supported.',
      availableAmount: 0,
    };
  }
}
