/**
 * Currency formatting utility for Nigerian Naira (₦)
 * All prices in the app are in NGN
 */

export const CURRENCY_SYMBOL = '₦';
export const CURRENCY_CODE = 'NGN';

/**
 * Format a number as Nigerian Naira
 * @param amount - The amount to format
 * @param showDecimal - Whether to show decimal places (default: true for amounts < 10000)
 */
export function formatPrice(amount: number, showDecimal = true): string {
  if (showDecimal) {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${CURRENCY_SYMBOL}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

/**
 * Format a large amount (e.g. revenue) with K/M suffix
 */
export function formatLargeAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000).toFixed(0)}K`;
  }
  return formatPrice(amount, false);
}
