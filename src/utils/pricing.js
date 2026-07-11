import { DEPOSIT_PERCENT, MIN_DEPOSIT } from '../config.js';

// The 30% deposit has a $150 floor so tiny orders (e.g. 1 m² of tapete)
// don't end up asking for a deposit of a few dozen pesos, but it never
// exceeds the total itself.
export function computeDepositAmount(discountedSubtotal) {
  if (discountedSubtotal <= 0) return 0;
  const pct = Math.round(discountedSubtotal * (DEPOSIT_PERCENT / 100));
  return Math.min(discountedSubtotal, Math.max(MIN_DEPOSIT, pct));
}
