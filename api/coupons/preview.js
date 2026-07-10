import { previewCoupon, couponErrorMessage } from '../_coupons.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, subtotal } = req.body || {};
  if (!code || typeof subtotal !== 'number' || subtotal <= 0) {
    return res.status(400).json({ error: 'Falta el código o el subtotal.' });
  }

  try {
    const coupon = await previewCoupon(code, subtotal);
    return res.status(200).json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount: Math.round(coupon.discount_amount),
    });
  } catch (err) {
    if (err.pgMessage) {
      return res.status(400).json({ error: couponErrorMessage(err) });
    }
    console.error(err);
    return res.status(500).json({ error: 'No se pudo validar el cupón.' });
  }
}
