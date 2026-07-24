import { FIXED_DEPOSIT } from '../config.js';

// The deposit is a flat amount regardless of order size, capped at the
// total so a coupon-shrunk order never ends up "depositing" more than
// it's actually worth.
export function computeDepositAmount(discountedSubtotal) {
  if (discountedSubtotal <= 0) return 0;
  return Math.min(discountedSubtotal, FIXED_DEPOSIT);
}
