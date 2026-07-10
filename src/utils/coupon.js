export function computeDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.type === 'percent') return Math.round(subtotal * (coupon.value / 100));
  return Math.min(coupon.value, subtotal);
}
