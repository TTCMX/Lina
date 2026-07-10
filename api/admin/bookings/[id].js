import { requireAdmin } from '../../_auth.js';
import { patchRow, sendEmail } from '../../_util.js';
import { customerCancelledEmailHtml, customerRescheduledEmailHtml } from '../../_email.js';
import { buildIcsContent } from '../../../src/utils/ics.js';

const VALID_STATUSES = ['confirmed', 'completed', 'cancelled'];

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status, booking_date, booking_date_label, booking_time } = req.body || {};

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }
  if ((booking_date && !booking_date_label) || (!booking_date && booking_date_label)) {
    return res.status(400).json({ error: 'booking_date y booking_date_label van juntos' });
  }

  const patch = { updated_at: new Date().toISOString() };
  if (status) patch.status = status;
  if (booking_date) patch.booking_date = booking_date;
  if (booking_date_label) patch.booking_date_label = booking_date_label;
  if (booking_time) patch.booking_time = booking_time;

  let rows;
  try {
    rows = await patchRow('bookings', { id: `eq.${id}` }, patch);
  } catch (err) {
    console.error(err);
    if (err.status === 409) {
      return res.status(409).json({ error: 'Ese horario ya está ocupado por otra reserva.' });
    }
    return res.status(500).json({ error: 'No se pudo actualizar la reserva.' });
  }

  const booking = rows[0];
  if (!booking) {
    return res.status(404).json({ error: 'Reserva no encontrada.' });
  }

  try {
    if (status === 'cancelled') {
      await sendEmail({
        to: booking.customer_email,
        subject: `Tu reserva con Lina fue cancelada — Folio ${booking.folio}`,
        text: `Hola ${booking.customer_name}, tu servicio (folio ${booking.folio}, ${booking.service_name} · ${booking.size_label}, ${booking.booking_date_label} ${booking.booking_time}) fue cancelado. Si tienes dudas, contáctanos.`,
        html: customerCancelledEmailHtml({
          customerName: booking.customer_name,
          folio: booking.folio,
          serviceName: booking.service_name,
          sizeLabel: booking.size_label,
          dateLabel: booking.booking_date_label,
          time: booking.booking_time,
        }),
      });
    } else if (booking_date || booking_time) {
      const location = `${booking.street}, ${booking.colonia}, ${booking.ciudad}`;
      const icsContent = buildIcsContent({
        uid: booking.folio,
        dateISO: booking.booking_date,
        time: booking.booking_time,
        summary: `Lina — ${booking.service_name} (${booking.size_label})`,
        description: `Folio: ${booking.folio}. Servicio de ${booking.service_name} (${booking.size_label}) con Lina.`,
        location,
      });
      await sendEmail({
        to: booking.customer_email,
        subject: `Tu reserva con Lina fue reagendada — Folio ${booking.folio}`,
        text: `Hola ${booking.customer_name}, tu servicio (folio ${booking.folio}) quedó reagendado para ${booking.booking_date_label}, ${booking.booking_time}.`,
        html: customerRescheduledEmailHtml({
          customerName: booking.customer_name,
          folio: booking.folio,
          serviceName: booking.service_name,
          sizeLabel: booking.size_label,
          dateLabel: booking.booking_date_label,
          time: booking.booking_time,
          street: booking.street,
          colonia: booking.colonia,
          ciudad: booking.ciudad,
        }),
        attachments: [
          { filename: `lina-${booking.folio}.ics`, content: Buffer.from(icsContent).toString('base64') },
        ],
      });
    }
  } catch (err) {
    console.error('Booking updated but customer notification failed:', err);
  }

  return res.status(200).json({ booking });
}
