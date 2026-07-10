import { useState } from 'react';
import { getDateOptions, TIME_SLOTS } from '../../utils/dates';
import { money } from '../../utils/money';

const STATUS_STYLE = {
  pending_payment: { bg: 'oklch(0.95 0.05 80)', color: 'oklch(0.45 0.1 80)', label: 'Pago pendiente' },
  confirmed: { bg: 'var(--color-primary-light)', color: 'var(--color-primary-tint)', label: 'Confirmada' },
  completed: { bg: 'var(--color-dark)', color: '#fff', label: 'Completada' },
  cancelled: { bg: 'oklch(0.93 0.02 25)', color: 'oklch(0.45 0.15 25)', label: 'Cancelada' },
};

const dateOptions = getDateOptions();

export default function BookingCard({ booking, onUpdated, onError }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState(null);
  const [takenSlots, setTakenSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const statusStyle = STATUS_STYLE[booking.status] || STATUS_STYLE.confirmed;
  const isConfirmed = booking.status === 'confirmed';
  const isPendingPayment = booking.status === 'pending_payment';

  async function patch(body) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings?id=${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar la reserva.');
      onUpdated(data.booking);
      return true;
    } catch (err) {
      onError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleComplete() {
    if (!window.confirm(`¿Marcar el folio ${booking.folio} como completada?`)) return;
    patch({ status: 'completed' });
  }

  async function handleCancel() {
    if (!window.confirm(`¿Cancelar el folio ${booking.folio}? Se le avisará al cliente por correo.`)) return;
    patch({ status: 'cancelled' });
  }

  async function loadAvailability(date) {
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?date=${date}&excludeId=${booking.id}`);
      const data = await res.json();
      setTakenSlots(res.ok ? data.takenSlots || [] : []);
    } catch {
      setTakenSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleOpenReschedule() {
    setRescheduling(true);
    setNewDate(null);
    setNewTime(null);
    setTakenSlots([]);
  }

  async function handleSelectDate(d) {
    setNewDate(d);
    setNewTime(null);
    await loadAvailability(d.key);
  }

  async function handleConfirmReschedule() {
    const ok = await patch({
      booking_date: newDate.key,
      booking_date_label: `${newDate.weekday} ${newDate.dayNum} ${newDate.month}`,
      booking_time: newTime,
    });
    if (ok) setRescheduling(false);
  }

  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{booking.folio}</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted-3)' }}>
            {new Date(booking.created_at).toLocaleString('es-MX')}
          </div>
        </div>
        <div style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: statusStyle.bg, color: statusStyle.color }}>
          {statusStyle.label}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 14, marginBottom: 12 }}>
        <Field label="Cliente" value={`${booking.customer_name} · ${booking.customer_phone}`} />
        <Field label="Correo" value={booking.customer_email} />
        <Field label="Servicio" value={`${booking.service_name} · ${booking.size_label} x${booking.qty}`} />
        <Field label="Fecha" value={`${booking.booking_date_label}, ${booking.booking_time}`} />
        <Field label="Dirección" value={`${booking.street}, ${booking.colonia}, ${booking.ciudad}`} />
        <Field label="Pago" value={`${booking.payment_type === 'deposit' ? 'Depósito' : 'Completo'} · ${money(booking.amount_charged)}`} />
        {booking.referencias && <Field label="Referencias" value={booking.referencias} />}
      </div>

      {isConfirmed && !rescheduling && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <SmallButton onClick={handleComplete} disabled={saving}>Marcar completada</SmallButton>
          <SmallButton onClick={handleOpenReschedule} disabled={saving}>Reagendar</SmallButton>
          <SmallButton onClick={handleCancel} disabled={saving} danger>Cancelar</SmallButton>
        </div>
      )}

      {isPendingPayment && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted-3)' }}>El cliente no ha completado el pago todavía. El horario sigue apartado.</div>
          <div>
            <SmallButton onClick={handleCancel} disabled={saving} danger>Cancelar y liberar horario</SmallButton>
          </div>
        </div>
      )}

      {rescheduling && (
        <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 6, paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Nueva fecha y hora</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 12 }}>
            {dateOptions.map((d) => {
              const isSelected = newDate?.key === d.key;
              return (
                <div
                  key={d.key}
                  onClick={() => handleSelectDate(d)}
                  style={{
                    cursor: 'pointer', flexShrink: 0, width: 54, padding: '10px 0', borderRadius: 12, textAlign: 'center',
                    background: isSelected ? 'var(--color-primary)' : '#fff',
                    border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: isSelected ? '#fff' : 'var(--color-text)',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>{d.weekday}</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{d.dayNum}</div>
                </div>
              );
            })}
          </div>

          {newDate && (
            loadingSlots ? (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted-3)', marginBottom: 12 }}>Consultando disponibilidad...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginBottom: 12 }}>
                {TIME_SLOTS.map((t) => {
                  const isSelected = newTime === t;
                  const isTaken = takenSlots.includes(t);
                  return (
                    <div
                      key={t}
                      onClick={isTaken ? undefined : () => setNewTime(t)}
                      style={{
                        cursor: isTaken ? 'not-allowed' : 'pointer',
                        opacity: isTaken ? 0.45 : 1,
                        textAlign: 'center', padding: '10px 6px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                        background: isSelected ? 'var(--color-primary-light)' : '#fff',
                        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        color: isSelected ? 'var(--color-primary-tint)' : 'var(--color-text)',
                      }}
                    >
                      {t}{isTaken ? ' · Ocupado' : ''}
                    </div>
                  );
                })}
              </div>
            )
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <SmallButton onClick={() => setRescheduling(false)} disabled={saving}>Cancelar cambio</SmallButton>
            <SmallButton onClick={handleConfirmReschedule} disabled={saving || !newDate || !newTime} primary>
              {saving ? 'Guardando...' : 'Confirmar nueva fecha'}
            </SmallButton>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, color: 'var(--color-text-muted-3)' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function SmallButton({ onClick, disabled, children, danger, primary }) {
  const base = {
    padding: '9px 16px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: '1px solid var(--color-border-strong)',
    background: '#fff',
    color: 'var(--color-text)',
  };
  if (danger) {
    base.border = '1px solid oklch(0.7 0.15 25)';
    base.color = 'oklch(0.5 0.18 25)';
  }
  if (primary) {
    base.background = 'var(--color-primary)';
    base.color = '#fff';
    base.border = '1px solid var(--color-primary)';
  }
  return (
    <button onClick={onClick} disabled={disabled} style={base}>
      {children}
    </button>
  );
}
