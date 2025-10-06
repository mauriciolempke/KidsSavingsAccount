/**
 * Rounding Utilities
 * 
 * All financial calculations must round up to the nearest integer dollar.
 * This ensures kids always get the benefit of fractional amounts.
 */

/**
 * Rounds up to the nearest integer dollar.
 * Always rounds in favor of the child (up for positive amounts).
 * 
 * Examples:
 * - 1.1 → 2
 * - 1.9 → 2
 * - 1.0 → 1
 * - 0.1 → 1
 * - 0.0 → 0
 * - -0.1 → 0 (for withdrawals, use absolute value)
 * 
 * @param amount The amount to round (can be fractional)
 * @returns The rounded integer amount
 */
export function roundUp(amount: number): number {
  return Math.ceil(amount);
}

/**
 * Calculates percentage of an amount and rounds up.
 * 
 * @param amount Base amount
 * @param percentage Percentage (0-100)
 * @returns Rounded up result
 * 
 * Examples:
 * - calculatePercentage(100, 5) → 5
 * - calculatePercentage(100, 1.5) → 2
 * - calculatePercentage(100, 0.1) → 1
 */
export function calculatePercentage(amount: number, percentage: number): number {
  const result = (amount * percentage) / 100;
  return roundUp(result);
}

/**
 * Applies interest to an amount.
 * 
 * @param balance Current balance
 * @param interestRate Percentage rate (0-100)
 * @returns Interest amount (rounded up)
 */
export function calculateInterest(balance: number, interestRate: number): number {
  return calculatePercentage(balance, interestRate);
}

/**
 * Ensures amount is a non-negative integer.
 * Useful for sanitizing calculations.
 */
export function ensureNonNegative(amount: number): number {
  return Math.max(0, Math.ceil(amount));
}

/**
 * Caps an amount to a maximum value.
 * Returns the smaller of the two values, both rounded up.
 */
export function capAmount(amount: number, max: number): number {
  return Math.min(roundUp(amount), roundUp(max));
}

