/** Handles currency converter functionality. */
export class CurrencyConverter {
  public static readonly USD_TO_INR_RATE = 83;
  private static readonly INR_TO_USD_RATE =
    1 / CurrencyConverter.USD_TO_INR_RATE;

  /**
   * Convert to u s d for the CurrencyConverter entity.
   *
   * @param amount - The amount information.
   * @param fromCurrency - The from currency information.
   * @returns The result of the operation.
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
