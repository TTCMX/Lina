import { requireAdmin } from '../_auth.js';
import { queryRows, insertRow, patchRow, requireFields } from '../_util.js';

const TYPES = ['percent', 'fixed'];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    try {
      const rows = await queryRows('coupons', { select: '*', order: 'created_at.desc' });
      return res.status(200).json({ coupons: rows });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'No se pudieron cargar los cupones.' });
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const missing = requireFields(body, ['code', 'type', 'value']);
    if (missing) {
      return res.status(400).json({ error: `Falta el campo: ${missing}` });
    }
    if (!TYPES.includes(body.type)) {
      return res.status(400).json({ error: 'Tipo de cupón inválido.' });
    }
    const value = Number(body.value);
    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ error: 'El valor del cupón debe ser mayor a 0.' });
    }
    if (body.type === 'percent' && value > 100) {
      return res.status(400).json({ error: 'Un cupón de porcentaje no puede ser mayor a 100.' });
    }

    try {
      const [coupon] = await insertRow('coupons', {
        code: String(body.code).trim().toUpperCase(),
        type: body.type,
        value,
        active: true,
        expires_at: body.expiresAt || null,
        max_uses: body.maxUses ? Number(body.maxUses) : null,
        min_subtotal: body.minSubtotal ? Number(body.minSubtotal) : null,
      }, { returning: true });
      return res.status(200).json({ coupon });
    } catch (err) {
      console.error(err);
      if (err.status === 409) {
        return res.status(409).json({ error: 'Ya existe un cupón con ese código.' });
      }
      return res.status(500).json({ error: 'No se pudo crear el cupón.' });
    }
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Falta el parámetro id' });
    }
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

  res.setHeader('Allow', 'GET, POST, PATCH');
  return res.status(405).json({ error: 'Method not allowed' });
}
