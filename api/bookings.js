import { insertRow, sendEmail, sendManagerNotification, requireFields } from './_util.js';
import { customerBookingEmailHtml, managerBookingEmailHtml } from './_email.js';
import { buildIcsContent } from '../src/utils/ics.js';

const REQUIRED_FIELDS = [
  'serviceId', 'serviceName', 'sizeId', 'sizeLabel', 'qty', 'unitPrice', 'subtotal',
  'date', 'dateLabel', 'time',
  'customerName', 'customerPhone', 'customerEmail',
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
      customer_email: body.customerEmail,
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

  const paymentLine = body.paymentType === 'deposit'
    ? `Depósito pagado: $${body.amountCharged} MXN (el resto se paga al terminar el servicio)`
    : `Pago completo: $${body.amountCharged} MXN`;

  const emailData = {
    folio,
    customerName: body.customerName,
    customerPhone: body.customerPhone,
    customerEmail: body.customerEmail,
    serviceName: body.serviceName,
    sizeLabel: body.sizeLabel,
    qty: body.qty,
    dateLabel: body.dateLabel,
    time: body.time,
    street: body.street,
    colonia: body.colonia,
    ciudad: body.ciudad,
    referencias: body.referencias || null,
    paymentLine,
  };

  try {
    await sendManagerNotification({
      subject: `Nueva reserva ${folio} — ${body.serviceName}`,
      text: [
        `Folio: ${folio}`,
        `Cliente: ${body.customerName} — ${body.customerPhone} — ${body.customerEmail}`,
        `Servicio: ${body.serviceName} · ${body.sizeLabel} x${body.qty}`,
        `Fecha: ${body.dateLabel}, ${body.time}`,
        `Dirección: ${body.street}, ${body.colonia}, ${body.ciudad}`,
        body.referencias ? `Referencias: ${body.referencias}` : null,
        `Pago: ${paymentLine}`,
      ].filter(Boolean).join('\n'),
      html: managerBookingEmailHtml(emailData),
    });
  } catch (err) {
    console.error('Booking saved but manager notification email failed:', err);
  }

  try {
    const location = `${body.street}, ${body.colonia}, ${body.ciudad}`;
    const icsContent = buildIcsContent({
      uid: folio,
      dateISO: body.date,
      time: body.time,
      summary: `Lina — ${body.serviceName} (${body.sizeLabel})`,
      description: `Folio: ${folio}. Servicio de ${body.serviceName} (${body.sizeLabel}) con Lina.`,
      location,
    });

    await sendEmail({
      to: body.customerEmail,
      subject: `Tu reserva con Lina está confirmada — Folio ${folio}`,
      text: [
        `¡Hola ${body.customerName}!`,
        '',
        'Tu servicio con Lina quedó agendado. Aquí el resumen:',
        '',
        `Folio: ${folio}`,
        `Servicio: ${body.serviceName} · ${body.sizeLabel} x${body.qty}`,
        `Fecha: ${body.dateLabel}, ${body.time}`,
        `Dirección: ${body.street}, ${body.colonia}, ${body.ciudad}`,
        paymentLine,
        '',
        'Adjuntamos un archivo .ics para que agregues la cita a tu calendario.',
        'Te enviaremos un recordatorio antes de la visita. Si necesitas cambiar algo, contáctanos respondiendo este correo.',
        '',
        '— Equipo Lina',
      ].join('\n'),
      html: customerBookingEmailHtml(emailData),
      attachments: [
        { filename: `lina-${folio}.ics`, content: Buffer.from(icsContent).toString('base64') },
      ],
    });
  } catch (err) {
    console.error('Booking saved but customer confirmation email failed:', err);
  }

  return res.status(200).json({ folio });
}
