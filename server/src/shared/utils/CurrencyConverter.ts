export class CurrencyConverter {
  /**
   * Fixed exchange rate for sandbox testing.
   * 1 USD = 83 INR
   */
  private static readonly INR_TO_USD_RATE = 1 / 83;

  /**
   * Converts an amount from a source currency to USD ($).
   * @param amount The amount in the source currency
   * @param fromCurrency The ISO currency code (e.g., 'INR')
   * @returns The converted amount in USD, rounded to 2 decimal places
   */
  public static convertToUSD(amount: number, fromCurrency: string): number {
    if (fromCurrency.toUpperCase() === 'USD') {
      return amount;
    }

    if (fromCurrency.toUpperCase() === 'INR') {
      const converted = amount * this.INR_TO_USD_RATE;
      return Math.round(converted * 100) / 100; // Round to 2 decimal places
    }

    // Default: return amount as is but log warning (simplify for sandbox)
    console.warn(
      `Unsupported currency conversion: ${fromCurrency} to USD. Returning original amount.`,
    );
    return amount;
  }
}
