import { insertRow, patchRow, queryRows, requireFields } from './_util.js';
import { createPreference } from './_mercadopago.js';
import { redeemCoupon, releaseCoupon, couponErrorMessage } from './_coupons.js';
import { findService } from '../src/data/services.js';
import { DEPOSIT_PERCENT } from '../src/config.js';

const REQUIRED_FIELDS = [
  'serviceId', 'sizeId', 'qty',
  'date', 'dateLabel', 'time',
  'customerName', 'customerPhone', 'customerEmail',
  'street', 'colonia', 'ciudad',
  'paymentType',
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleStatus(req, res);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const missing = requireFields(body, REQUIRED_FIELDS);
  if (missing) {
    return res.status(400).json({ error: `Falta el campo: ${missing}` });
  }

  // Never trust price/amount fields from the client — real money is on
  // the line. Recompute everything from the service catalog server-side.
  const service = findService(body.serviceId);
  const size = service?.sizes.find((z) => z.id === body.sizeId);
  if (!service || !size) {
    return res.status(400).json({ error: 'Servicio o tamaño inválido.' });
  }
  if (!['deposit', 'full'].includes(body.paymentType)) {
    return res.status(400).json({ error: 'Forma de pago inválida.' });
  }
  const qty = Math.min(10, Math.max(1, Math.round(Number(body.qty)) || 1));

  const unitPrice = size.price;
  const subtotal = unitPrice * qty;

  let coupon = null;
  if (body.couponCode) {
    try {
      coupon = await redeemCoupon(body.couponCode, subtotal);
    } catch (err) {
      if (err.pgMessage) {
        return res.status(400).json({ error: couponErrorMessage(err) });
      }
      console.error(err);
      return res.status(500).json({ error: 'No se pudo aplicar el cupón.' });
    }
  }

  const discountAmount = coupon ? Math.min(Math.round(coupon.discount_amount), subtotal) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const depositAmount = Math.round(discountedSubtotal * (DEPOSIT_PERCENT / 100));
  const amountCharged = body.paymentType === 'deposit' ? depositAmount : discountedSubtotal;

  const folio = 'LN-' + Math.floor(100000 + Math.random() * 900000);

  let booking;
  try {
    [booking] = await insertRow('bookings', {
      folio,
      service_id: service.id,
      service_name: service.name,
      size_id: size.id,
      size_label: size.label,
      qty,
      unit_price: unitPrice,
      subtotal,
      booking_date: body.date,
      booking_date_label: body.dateLabel,
      booking_time: body.time,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      customer_email: body.customerEmail,
      street: body.street,
      colonia: body.colonia,
      ciudad: body.ciudad,
      referencias: body.referencias || null,
      payment_type: body.paymentType,
      amount_charged: amountCharged,
      status: 'pending_payment',
      coupon_id: coupon?.coupon_id || null,
      coupon_code: coupon?.code || null,
      discount_amount: discountAmount,
    }, { returning: true });
  } catch (err) {
    console.error(err);
    if (coupon) await releaseCoupon(coupon.coupon_id);
    if (err.status === 409) {
      return res.status(409).json({ error: 'Ese horario ya no está disponible. Elige otra fecha u hora.' });
    }
    return res.status(500).json({ error: 'No se pudo guardar la reserva. Intenta de nuevo.' });
  }

  const siteUrl = process.env.SITE_URL.replace(/\/+$/, '');

  try {
    const preference = await createPreference({
      items: [
        {
          title: `Lina — ${service.name} (${size.label}) x${qty}`,
          quantity: 1,
          unit_price: amountCharged,
          currency_id: 'MXN',
        },
      ],
      externalReference: String(booking.id),
      backUrls: {
        success: `${siteUrl}/agendar/pago-exitoso?folio=${folio}`,
        failure: `${siteUrl}/agendar/pago-fallido?folio=${folio}`,
        pending: `${siteUrl}/agendar/pago-pendiente?folio=${folio}`,
      },
      metadata: { booking_id: booking.id, folio },
    });

    await patchRow('bookings', { id: `eq.${booking.id}` }, { mp_preference_id: preference.id });

    return res.status(200).json({ folio, checkoutUrl: preference.init_point });
  } catch (err) {
    console.error('Booking saved but Mercado Pago preference failed, releasing slot:', err);
    if (coupon) await releaseCoupon(coupon.coupon_id);
    try {
      await patchRow('bookings', { id: `eq.${booking.id}` }, { status: 'cancelled' });
    } catch (releaseErr) {
      console.error('Failed to release slot after preference error:', releaseErr);
    }
    return res.status(500).json({ error: 'No se pudo iniciar el pago. Intenta de nuevo.' });
  }
}

async function handleStatus(req, res) {
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
