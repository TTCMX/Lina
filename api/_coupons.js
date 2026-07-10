import { callRpc } from './_util.js';

const ERROR_MESSAGES = {
  COUPON_NOT_FOUND: 'Ese cupón no existe.',
  COUPON_INACTIVE: 'Ese cupón ya no está activo.',
  COUPON_EXPIRED: 'Ese cupón ya expiró.',
  COUPON_EXHAUSTED: 'Ese cupón ya alcanzó su límite de usos.',
  COUPON_MIN_NOT_MET: 'Tu compra no alcanza el mínimo para este cupón.',
};

export function couponErrorMessage(err) {
  return ERROR_MESSAGES[err.pgMessage] || 'No se pudo aplicar el cupón.';
}

export async function previewCoupon(code, subtotal) {
  const [row] = await callRpc('preview_coupon', { p_code: code, p_subtotal: subtotal });
  return row;
}

export async function redeemCoupon(code, subtotal) {
  const [row] = await callRpc('redeem_coupon', { p_code: code, p_subtotal: subtotal });
  return row;
}

export async function releaseCoupon(couponId) {
  if (!couponId) return;
  try {
    await callRpc('release_coupon', { p_coupon_id: couponId });
  } catch (err) {
    console.error('Failed to release coupon', couponId, err);
  }
}
