import { queryRows } from '../_util.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const folio = req.query.folio;
  if (!folio) {
    return res.status(400).json({ error: 'Falta el folio' });
  }

  try {
    // Deliberately minimal fields — this endpoint is public/unauthenticated,
    // so no customer PII (name/phone/email/address) goes in the response.
    const rows = await queryRows('bookings', {
      folio: `eq.${folio}`,
      select: 'folio,status,booking_date_label,booking_time',
    });
    const booking = rows[0];
    if (!booking) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    return res.status(200).json({
      folio: booking.folio,
      status: booking.status,
      dateLabel: booking.booking_date_label,
      time: booking.booking_time,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo consultar la reserva.' });
  }
}
