import { insertRow, sendNotification, requireFields } from './_util.js';

const REQUIRED_FIELDS = [
  'serviceId', 'serviceName', 'sizeId', 'sizeLabel', 'qty', 'unitPrice', 'subtotal',
  'date', 'dateLabel', 'time',
  'customerName', 'customerPhone',
  'street', 'colonia', 'ciudad',
  'paymentType', 'amountCharged',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const missing = requireFields(body, REQUIRED_FIELDS);
  if (missing) {
    return res.status(400).json({ error: `Falta el campo: ${missing}` });
  }

  const folio = 'LN-' + Math.floor(100000 + Math.random() * 900000);

  try {
    await insertRow('bookings', {
      folio,
      service_id: body.serviceId,
      service_name: body.serviceName,
      size_id: body.sizeId,
      size_label: body.sizeLabel,
      qty: body.qty,
      unit_price: body.unitPrice,
      subtotal: body.subtotal,
      booking_date: body.date,
      booking_date_label: body.dateLabel,
      booking_time: body.time,
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      street: body.street,
      colonia: body.colonia,
      ciudad: body.ciudad,
      referencias: body.referencias || null,
      payment_type: body.paymentType,
      amount_charged: body.amountCharged,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo guardar la reserva. Intenta de nuevo.' });
  }

  try {
    await sendNotification({
      subject: `Nueva reserva ${folio} — ${body.serviceName}`,
      text: [
        `Folio: ${folio}`,
        `Cliente: ${body.customerName} — ${body.customerPhone}`,
        `Servicio: ${body.serviceName} · ${body.sizeLabel} x${body.qty}`,
        `Fecha: ${body.dateLabel}, ${body.time}`,
        `Dirección: ${body.street}, ${body.colonia}, ${body.ciudad}`,
        body.referencias ? `Referencias: ${body.referencias}` : null,
        `Pago: ${body.paymentType === 'deposit' ? 'Depósito' : 'Completo'} — $${body.amountCharged} MXN`,
      ].filter(Boolean).join('\n'),
    });
  } catch (err) {
    console.error('Booking saved but notification email failed:', err);
  }

  return res.status(200).json({ folio });
}
