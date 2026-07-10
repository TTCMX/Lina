import { createSessionCookie, clearSessionCookie, checkPassword, isAuthenticated } from '../_auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: isAuthenticated(req) });
  }

  if (req.method === 'POST') {
    const { action, password } = req.body || {};

    if (action === 'login') {
      if (!checkPassword(password)) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
      res.setHeader('Set-Cookie', createSessionCookie());
      return res.status(200).json({ ok: true });
    }

    if (action === 'logout') {
      res.setHeader('Set-Cookie', clearSessionCookie());
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Falta o es inválido el campo: action' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
