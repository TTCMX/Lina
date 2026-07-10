import { queryRows, patchRow } from '../_util.js';
import { getPayment, verifyWebhookSignature } from '../_mercadopago.js';
import { notifyBookingConfirmed } from '../_notify.js';
import { releaseCoupon } from '../_coupons.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const dataId = req.body?.data?.id;
  const type = req.body?.type;

  if (type !== 'payment') {
    // Other event types (or MP's connectivity test pings) — nothing to do.
    return res.status(200).json({ ok: true });
  }

  const valid = verifyWebhookSignature({
    xSignature: req.headers['x-signature'],
    xRequestId: req.headers['x-request-id'],
    dataId,
  });
  if (!valid) {
    console.error('Rejected webhook with invalid signature', { dataId });
    return res.status(401).json({ error: 'Firma inválida' });
  }

  let payment;
  try {
    payment = await getPayment(dataId);
  } catch (err) {
    console.error('Failed to fetch payment from Mercado Pago:', err);
    return res.status(500).json({ error: 'No se pudo verificar el pago.' });
  }

  const bookingId = payment.external_reference;
  if (!bookingId) {
    console.error('Payment has no external_reference, ignoring', payment.id);
    return res.status(200).json({ ok: true });
  }

  let rows;
  try {
    rows = await queryRows('bookings', { id: `eq.${bookingId}`, select: '*' });
  } catch (err) {
    console.error('Failed to look up booking for webhook:', err);
    return res.status(500).json({ error: 'No se pudo consultar la reserva.' });
  }

  const booking = rows[0];
  if (!booking) {
    console.error('No booking found for external_reference', bookingId);
    return res.status(200).json({ ok: true });
  }

  // Already in a terminal state — likely a duplicate webhook delivery.
  // Don't re-send emails or flip status again.
  if (booking.status === 'confirmed' || booking.status === 'cancelled') {
    return res.status(200).json({ ok: true });
  }

  try {
    if (payment.status === 'approved') {
      const [updated] = await patchRow(
        'bookings',
        { id: `eq.${booking.id}` },
        { status: 'confirmed', mp_payment_id: String(payment.id), updated_at: new Date().toISOString() }
      );
      await notifyBookingConfirmed(updated);
    } else if (['rejected', 'cancelled'].includes(payment.status)) {
      await patchRow(
        'bookings',
        { id: `eq.${booking.id}` },
        { status: 'cancelled', mp_payment_id: String(payment.id), updated_at: new Date().toISOString() }
      );
      if (booking.coupon_id) await releaseCoupon(booking.coupon_id);
    } else {
      // pending / in_process / authorized / etc — leave as pending_payment,
      // just record the payment id for traceability.
      await patchRow('bookings', { id: `eq.${booking.id}` }, { mp_payment_id: String(payment.id) });
    }
  } catch (err) {
    console.error('Failed to update booking after payment webhook:', err);
    return res.status(500).json({ error: 'No se pudo actualizar la reserva.' });
  }

  return res.status(200).json({ ok: true });
}
