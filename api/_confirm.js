import { queryRows, patchRow } from './_util.js';
import { getPayment } from './_mercadopago.js';
import { notifyBookingConfirmed } from './_notify.js';
import { releaseCoupon } from './_coupons.js';

// Shared by the Mercado Pago webhook and by the customer's own return-page
// poll (which passes back the payment_id Mercado Pago appends to the
// success/pending redirect). Both paths end up here so a booking only ever
// gets confirmed once, however the confirmation was triggered.
//
// The `status: eq.pending_payment` filter on the PATCH makes the state
// transition atomic at the database level: if the webhook and the return
// page race each other, only the first PATCH actually matches a row and
// flips the status, so only one of them sends the confirmation email.
export async function confirmPaymentById(paymentId) {
  const payment = await getPayment(paymentId);

  const bookingId = payment.external_reference;
  if (!bookingId) return null;

  const rows = await queryRows('bookings', { id: `eq.${bookingId}`, select: '*' });
  const booking = rows[0];
  if (!booking) return null;
  if (booking.status === 'confirmed' || booking.status === 'cancelled') return booking;

  if (payment.status === 'approved') {
    const updatedRows = await patchRow(
      'bookings',
      { id: `eq.${booking.id}`, status: 'eq.pending_payment' },
      { status: 'confirmed', mp_payment_id: String(payment.id), updated_at: new Date().toISOString() }
    );
    if (!updatedRows.length) return { ...booking, status: 'confirmed' };
    const updated = updatedRows[0];
    await notifyBookingConfirmed(updated);
    return updated;
  }

  if (['rejected', 'cancelled'].includes(payment.status)) {
    const updatedRows = await patchRow(
      'bookings',
      { id: `eq.${booking.id}`, status: 'eq.pending_payment' },
      { status: 'cancelled', mp_payment_id: String(payment.id), updated_at: new Date().toISOString() }
    );
    if (updatedRows.length && booking.coupon_id) await releaseCoupon(booking.coupon_id);
    return updatedRows[0] || { ...booking, status: 'cancelled' };
  }

  // pending / in_process / authorized / etc — leave as pending_payment,
  // just record the payment id for traceability.
  await patchRow('bookings', { id: `eq.${booking.id}` }, { mp_payment_id: String(payment.id) });
  return booking;
}
