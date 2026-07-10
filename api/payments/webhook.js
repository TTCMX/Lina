import { queryRows, patchRow } from '../_util.js';
import { getPayment, verifyWebhookSignature } from '../_mercadopago.js';
import { notifyBookingConfirmed } from '../_notify.js';
import { releaseCoupon } from '../_coupons.js';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

// Mercado Pago has sent notifications in more than one shape over the
// years: the current one is a POST with a JSON body ({ type, data: { id } }),
// but some notifications (retries, the dashboard's "simulate" button, the
// legacy IPN format) arrive as query params instead (?data.id=X&type=payment
// or the older ?topic=payment&id=X). Check both so a shape mismatch doesn't
// silently swallow the notification.
function extractEvent(req) {
  const body = parseBody(req);
  const query = req.query || {};

  const dataId = body?.data?.id || query['data.id'] || query.id || null;
  let type = body?.type || query.type || null;
  if (!type && query.topic === 'payment') type = 'payment';

  return { dataId, type, body };
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dataId, type, body } = extractEvent(req);

  console.log('[mp-webhook] incoming', {
    method: req.method,
    query: req.query,
    bodyType: typeof req.body,
    bodyKeys: body && typeof body === 'object' ? Object.keys(body) : null,
    resolvedType: type,
    resolvedDataId: dataId,
    hasSignatureHeader: !!req.headers['x-signature'],
    hasRequestIdHeader: !!req.headers['x-request-id'],
  });

  if (type !== 'payment') {
    console.log('[mp-webhook] ignoring non-payment event', { type });
    return res.status(200).json({ ok: true });
  }

  if (!dataId) {
    console.error('[mp-webhook] payment event with no resolvable data id, ignoring', { body, query: req.query });
    return res.status(200).json({ ok: true });
  }

  const valid = verifyWebhookSignature({
    xSignature: req.headers['x-signature'],
    xRequestId: req.headers['x-request-id'],
    dataId,
  });
  if (!valid) {
    console.error('[mp-webhook] rejected: invalid signature', {
      dataId,
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
    });
    return res.status(401).json({ error: 'Firma inválida' });
  }

  let payment;
  try {
    payment = await getPayment(dataId);
  } catch (err) {
    console.error('[mp-webhook] failed to fetch payment from Mercado Pago:', err);
    return res.status(500).json({ error: 'No se pudo verificar el pago.' });
  }

  console.log('[mp-webhook] payment fetched', { id: payment.id, status: payment.status, external_reference: payment.external_reference });

  const bookingId = payment.external_reference;
  if (!bookingId) {
    console.error('[mp-webhook] payment has no external_reference, ignoring', payment.id);
    return res.status(200).json({ ok: true });
  }

  let rows;
  try {
    rows = await queryRows('bookings', { id: `eq.${bookingId}`, select: '*' });
  } catch (err) {
    console.error('[mp-webhook] failed to look up booking:', err);
    return res.status(500).json({ error: 'No se pudo consultar la reserva.' });
  }

  const booking = rows[0];
  if (!booking) {
    console.error('[mp-webhook] no booking found for external_reference', bookingId);
    return res.status(200).json({ ok: true });
  }

  // Already in a terminal state — likely a duplicate webhook delivery.
  // Don't re-send emails or flip status again.
  if (booking.status === 'confirmed' || booking.status === 'cancelled') {
    console.log('[mp-webhook] booking already in terminal state, skipping', { bookingId, status: booking.status });
    return res.status(200).json({ ok: true });
  }

  try {
    if (payment.status === 'approved') {
      const [updated] = await patchRow(
        'bookings',
        { id: `eq.${booking.id}` },
        { status: 'confirmed', mp_payment_id: String(payment.id), updated_at: new Date().toISOString() }
      );
      console.log('[mp-webhook] booking confirmed, sending notifications', { folio: updated.folio });
      await notifyBookingConfirmed(updated);
    } else if (['rejected', 'cancelled'].includes(payment.status)) {
      await patchRow(
        'bookings',
        { id: `eq.${booking.id}` },
        { status: 'cancelled', mp_payment_id: String(payment.id), updated_at: new Date().toISOString() }
      );
      if (booking.coupon_id) await releaseCoupon(booking.coupon_id);
      console.log('[mp-webhook] booking cancelled due to payment status', payment.status);
    } else {
      // pending / in_process / authorized / etc — leave as pending_payment,
      // just record the payment id for traceability.
      await patchRow('bookings', { id: `eq.${booking.id}` }, { mp_payment_id: String(payment.id) });
      console.log('[mp-webhook] payment still in non-terminal state', payment.status);
    }
  } catch (err) {
    console.error('[mp-webhook] failed to update booking after payment webhook:', err);
    return res.status(500).json({ error: 'No se pudo actualizar la reserva.' });
  }

  return res.status(200).json({ ok: true });
}
