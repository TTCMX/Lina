import { useEffect, useState } from 'react';
import BookingCard from './BookingCard';

const STATUS_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'pending_payment', label: 'Pago pendiente' },
  { id: 'completed', label: 'Completadas' },
  { id: 'cancelled', label: 'Canceladas' },
];

export default function AdminDashboard({ onLoggedOut }) {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [statusFilter, setStatusFilter] = useState('confirmed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadBookings() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar las reservas.');
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/contact-messages');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar los mensajes.');
      setMessages(data.messages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === 'bookings') loadBookings();
    else loadMessages();
  }, [tab]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    onLoggedOut();
  }

  function handleBookingUpdated(updated) {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  const visibleBookings = statusFilter === 'all' ? bookings : bookings.filter((b) => b.status === statusFilter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{ borderBottom: '1px solid var(--color-border)', background: '#fff' }}>
        <div style={{ maxWidth: 'min(900px, 94vw)', margin: '0 auto', padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--color-gold)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600 }}>Lina — Admin</span>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: '1px solid var(--color-border-strong)', padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Salir
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 'min(900px, 94vw)', margin: '0 auto', padding: '24px 0 60px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => setTab('bookings')}
            style={tabButtonStyle(tab === 'bookings')}
          >
            Reservas
          </button>
          <button
            onClick={() => setTab('messages')}
            style={tabButtonStyle(tab === 'messages')}
          >
            Mensajes de contacto
          </button>
        </div>

        {tab === 'bookings' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: statusFilter === f.id ? 'var(--color-primary)' : '#fff',
                  color: statusFilter === f.id ? '#fff' : 'var(--color-text)',
                  border: `1px solid ${statusFilter === f.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 16, fontSize: 14, color: 'oklch(0.5 0.18 25)', background: 'oklch(0.96 0.03 25)', padding: '12px 14px', borderRadius: 10 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: 'var(--color-text-muted-3)' }}>Cargando...</div>
        ) : tab === 'bookings' ? (
          visibleBookings.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted-3)' }}>No hay reservas en este filtro.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {visibleBookings.map((b) => (
                <BookingCard key={b.id} booking={b} onUpdated={handleBookingUpdated} onError={setError} />
              ))}
            </div>
          )
        ) : messages.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted-3)' }}>No hay mensajes todavía.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted-3)' }}>{new Date(m.created_at).toLocaleString('es-MX')}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted-2)', marginBottom: 6 }}>{m.phone}</div>
                {m.message && <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{m.message}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function tabButtonStyle(active) {
  return {
    padding: '10px 18px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    background: active ? 'var(--color-dark)' : '#fff',
    color: active ? '#fff' : 'var(--color-text)',
    border: `1px solid ${active ? 'var(--color-dark)' : 'var(--color-border)'}`,
  };
}
