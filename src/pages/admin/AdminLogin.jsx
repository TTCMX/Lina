import { useState } from 'react';
import { inputStyle, labelStyle, card, primaryButton } from '../../styles';

export default function AdminLogin({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión.');
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ ...card, padding: 32, width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--color-gold)' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600 }}>Lina — Admin</span>
        </div>
        <div>
          <label style={labelStyle}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            autoFocus
          />
        </div>
        {error && (
          <div style={{ fontSize: 13, color: 'oklch(0.5 0.18 25)', background: 'oklch(0.96 0.03 25)', padding: '10px 14px', borderRadius: 10 }}>
            {error}
          </div>
        )}
        <button type="submit" disabled={submitting || !password} style={{ ...primaryButton, opacity: submitting || !password ? 0.6 : 1 }}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
