const COLOR = {
  bg: '#fcfaf6',
  primary: '#00696f',
  primaryTint: '#d5f2f3',
  text: '#141b24',
  textMuted: '#4d5660',
  textMuted2: '#5b646f',
  border: '#dce2e8',
  gold: '#c29e61',
  white: '#ffffff',
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function layout({ eyebrow, heading, bodyHtml, detailRows }) {
  const rowsHtml = detailRows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:7px 0;font-size:14px;color:${COLOR.textMuted2};vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:7px 0;font-size:14px;color:${COLOR.text};font-weight:700;text-align:right;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${COLOR.bg};font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.bg};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:${COLOR.white};border-radius:16px;border:1px solid ${COLOR.border};">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid ${COLOR.border};">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:8px;">
                      <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:10px;height:10px;border-radius:5px;background:${COLOR.gold};font-size:0;line-height:0;">&nbsp;</td></tr></table>
                    </td>
                    <td style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;color:${COLOR.text};">Lina</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <div style="font-size:12px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;color:${COLOR.primary};margin:0 0 8px;">${escapeHtml(eyebrow)}</div>
                <h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:500;font-size:22px;color:${COLOR.text};margin:0 0 14px;">${escapeHtml(heading)}</h1>
                <div style="font-size:15px;line-height:1.6;color:${COLOR.textMuted};margin:0 0 20px;">${bodyHtml}</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${COLOR.bg};border-radius:12px;padding:16px 18px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${rowsHtml}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:${COLOR.bg};border-top:1px solid ${COLOR.border};border-radius:0 0 16px 16px;font-size:12px;color:${COLOR.textMuted2};">
                Lina — lavado profesional a domicilio<br/>
                +52 55 0000 0000 · hola@lina.mx
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function customerBookingEmailHtml({ customerName, folio, serviceName, sizeLabel, qty, dateLabel, time, street, colonia, ciudad, paymentLine }) {
  return layout({
    eyebrow: 'Reserva confirmada',
    heading: `¡Hola ${customerName}!`,
    bodyHtml: 'Tu servicio con Lina quedó agendado. Aquí el resumen, guárdalo por si lo necesitas:',
    detailRows: [
      ['Folio', folio],
      ['Servicio', `${serviceName} · ${sizeLabel} x${qty}`],
      ['Fecha', `${dateLabel}, ${time}`],
      ['Dirección', `${street}, ${colonia}, ${ciudad}`],
      ['Pago', paymentLine],
    ],
  });
}

export function managerBookingEmailHtml({ folio, customerName, customerPhone, customerEmail, serviceName, sizeLabel, qty, dateLabel, time, street, colonia, ciudad, referencias, paymentLine }) {
  const rows = [
    ['Folio', folio],
    ['Cliente', `${customerName}`],
    ['Teléfono', customerPhone],
    ['Correo', customerEmail],
    ['Servicio', `${serviceName} · ${sizeLabel} x${qty}`],
    ['Fecha', `${dateLabel}, ${time}`],
    ['Dirección', `${street}, ${colonia}, ${ciudad}`],
  ];
  if (referencias) rows.push(['Referencias', referencias]);
  rows.push(['Pago', paymentLine]);

  return layout({
    eyebrow: 'Nueva reserva',
    heading: `${serviceName} · ${sizeLabel}`,
    bodyHtml: 'Un cliente agendó un servicio. Detalles abajo:',
    detailRows: rows,
  });
}

export function managerContactEmailHtml({ name, phone, message }) {
  return layout({
    eyebrow: 'Nuevo mensaje',
    heading: name,
    bodyHtml: message ? escapeHtml(message).replaceAll('\n', '<br/>') : '<em>(sin mensaje)</em>',
    detailRows: [
      ['Nombre', name],
      ['Teléfono', phone],
    ],
  });
}
