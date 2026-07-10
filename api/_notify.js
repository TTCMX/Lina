import { sendEmail, sendManagerNotification } from './_util.js';
import { customerBookingEmailHtml, managerBookingEmailHtml } from './_email.js';
import { buildIcsContent } from '../src/utils/ics.js';

export async function notifyBookingConfirmed(booking) {
  const paymentLine = booking.payment_type === 'deposit'
    ? `Depósito pagado: $${booking.amount_charged} MXN (el resto se paga al terminar el servicio)`
    : `Pago completo: $${booking.amount_charged} MXN`;

  const emailData = {
    folio: booking.folio,
    customerName: booking.customer_name,
    customerPhone: booking.customer_phone,
    customerEmail: booking.customer_email,
    serviceName: booking.service_name,
    sizeLabel: booking.size_label,
    qty: booking.qty,
    dateLabel: booking.booking_date_label,
    time: booking.booking_time,
    street: booking.street,
    colonia: booking.colonia,
    ciudad: booking.ciudad,
    referencias: booking.referencias,
    paymentLine,
  };

  try {
    await sendManagerNotification({
      subject: `Nueva reserva ${booking.folio} — ${booking.service_name}`,
      text: [
        `Folio: ${booking.folio}`,
        `Cliente: ${booking.customer_name} — ${booking.customer_phone} — ${booking.customer_email}`,
        `Servicio: ${booking.service_name} · ${booking.size_label} x${booking.qty}`,
        `Fecha: ${booking.booking_date_label}, ${booking.booking_time}`,
        `Dirección: ${booking.street}, ${booking.colonia}, ${booking.ciudad}`,
        booking.referencias ? `Referencias: ${booking.referencias}` : null,
        `Pago: ${paymentLine}`,
      ].filter(Boolean).join('\n'),
      html: managerBookingEmailHtml(emailData),
    });
  } catch (err) {
    console.error('Booking confirmed but manager notification email failed:', err);
  }

  try {
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
      subject: `Tu reserva con Lina está confirmada — Folio ${booking.folio}`,
      text: [
        `¡Hola ${booking.customer_name}!`,
        '',
        'Tu pago se procesó y tu servicio con Lina quedó agendado. Aquí el resumen:',
        '',
        `Folio: ${booking.folio}`,
        `Servicio: ${booking.service_name} · ${booking.size_label} x${booking.qty}`,
        `Fecha: ${booking.booking_date_label}, ${booking.booking_time}`,
        `Dirección: ${booking.street}, ${booking.colonia}, ${booking.ciudad}`,
        paymentLine,
        '',
        'Adjuntamos un archivo .ics para que agregues la cita a tu calendario.',
        'Te enviaremos un recordatorio antes de la visita. Si necesitas cambiar algo, contáctanos respondiendo este correo.',
        '',
        '— Equipo Lina',
      ].join('\n'),
      html: customerBookingEmailHtml(emailData),
      attachments: [
        { filename: `lina-${booking.folio}.ics`, content: Buffer.from(icsContent).toString('base64') },
      ],
    });
  } catch (err) {
    console.error('Booking confirmed but customer confirmation email failed:', err);
  }
}
