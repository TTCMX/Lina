import { queryRows } from './_util.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const date = req.query.date;
  if (!date || !DATE_RE.test(date)) {
    return res.status(400).json({ error: 'Parámetro date inválido (usa YYYY-MM-DD)' });
  }

  const params = {
    booking_date: `eq.${date}`,
    status: 'neq.cancelled',
    select: 'booking_time',
  };

  const excludeId = req.query.excludeId;
  if (excludeId) {
    params.id = `neq.${excludeId}`;
  }

  try {
    const rows = await queryRows('bookings', params);
    return res.status(200).json({ date, takenSlots: rows.map((r) => r.booking_time) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo consultar disponibilidad.' });
  }
}
