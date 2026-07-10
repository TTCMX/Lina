import { requireAdmin } from '../_auth.js';
import { queryRows } from '../_util.js';

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rows = await queryRows('contact_messages', { select: '*', order: 'created_at.desc' });
    return res.status(200).json({ messages: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'No se pudieron cargar los mensajes.' });
  }
}
