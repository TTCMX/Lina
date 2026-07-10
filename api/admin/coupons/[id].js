import { requireAdmin } from '../../_auth.js';
import { patchRow } from '../../_util.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { active } = req.body || {};

  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'Falta el campo: active' });
  }

  try {
    const [coupon] = await patchRow('coupons', { id: `eq.${id}` }, { active });
    if (!coupon) return res.status(404).json({ error: 'Cupón no encontrado.' });
    return res.status(200).json({ coupon });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo actualizar el cupón.' });
  }
}
