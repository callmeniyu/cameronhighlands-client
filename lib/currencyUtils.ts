/**
 * Currency conversion utilities
 * Conversion rates as of 2025
 * 1 RM (Malaysian Ringgit) ≈ 0.22 USD ≈ 0.21 EUR
 */

const RM_TO_USD = 0.22;
const RM_TO_EUR = 0.21;

/**
 * Convert RM to USD
 */
export function rmToUsd(rm: number): number {
  return rm * RM_TO_USD;
}

/**
 * Convert RM to EUR
 */
export function rmToEur(rm: number): number {
  return rm * RM_TO_EUR;
}

/**
 * Format price with all three currencies
 * @param rm - Price in Malaysian Ringgit
 * @param showRmLabel - Whether to show "RM" label (default: true)
 * @returns Formatted string like "RM 235 ($52 / €49)"
 */
export function formatPriceWithCurrencies(
  rm: number,
  showRmLabel: boolean = true
): string {
  const usd = Math.round(rmToUsd(rm));
  const eur = Math.round(rmToEur(rm));
  const rmText = showRmLabel ? `RM ${rm}` : `${rm}`;
  return `${rmText} ($${usd} / €${eur})`;
}

/**
 * Get currency conversion text only (without RM)
 * @param rm - Price in Malaysian Ringgit
 * @returns Formatted string like "($52 / €49)"
 */
export function getCurrencyConversions(rm: number): string {
  const usd = Math.round(rmToUsd(rm));
  const eur = Math.round(rmToEur(rm));
  return `($${usd} / €${eur})`;
}

/**
 * Calculate coupon discount based on purchase amount
 * @param amount - Purchase amount in RM
 * @returns Object with coupon details
 */
export function calculateCoupon(amount: number): {
  applicable: boolean;
  discount: number;
  discountPercentage: number;
  finalAmount: number;
  tier: "none" | "100" | "200";
  message: string;
} {
  if (amount >= 200) {
    const discountPercentage = 10; // 10% for purchases above 200 RM
    const discount = amount * (discountPercentage / 100);
    return {
      applicable: true,
      discount,
      discountPercentage,
      finalAmount: amount - discount,
      tier: "200",
      message: `${discountPercentage}% discount applied for purchases above RM 200`,
    };
  } else if (amount >= 100) {
    const discountPercentage = 5; // 5% for purchases above 100 RM
    const discount = amount * (discountPercentage / 100);
    return {
      applicable: true,
      discount,
      discountPercentage,
      finalAmount: amount - discount,
      tier: "100",
      message: `${discountPercentage}% discount applied for purchases above RM 100`,
    };
  } else {
    return {
      applicable: false,
      discount: 0,
      discountPercentage: 0,
      finalAmount: amount,
      tier: "none",
      message: `Spend RM ${100 - amount} more to get 5% discount, or RM ${
        200 - amount
      } more for 10% discount`,
    };
  }
}
