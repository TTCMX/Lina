import { insertRow, sendNotification, requireFields } from './_util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const missing = requireFields(body, ['name', 'phone']);
  if (missing) {
    return res.status(400).json({ error: `Falta el campo: ${missing}` });
  }

  try {
    await insertRow('contact_messages', {
      name: body.name,
      phone: body.phone,
      message: body.message || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudo enviar tu mensaje. Intenta de nuevo.' });
  }

  try {
    await sendNotification({
      subject: `Nuevo mensaje de contacto — ${body.name}`,
      text: `Nombre: ${body.name}\nTeléfono: ${body.phone}\nMensaje: ${body.message || '(sin mensaje)'}`,
    });
  } catch (err) {
    console.error('Contact message saved but notification email failed:', err);
  }

  return res.status(200).json({ ok: true });
}
