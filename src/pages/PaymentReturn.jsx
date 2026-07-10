import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { wizardContainer, card, primaryButton, secondaryButton } from '../styles';

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15;

export default function PaymentReturn({ outcome }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const folio = searchParams.get('folio');
  const [booking, setBooking] = useState(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!folio || outcome === 'failure') return undefined;
    let cancelled = false;
    let attempts = 0;

    async function tick() {
      if (cancelled) return;
      try {
        const res = await fetch(`/api/bookings?folio=${folio}`);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setBooking(data);
          if (data.status === 'confirmed' || data.status === 'cancelled') return;
        }
      } catch {
        // transient network hiccup — just retry
      }
      attempts += 1;
      if (attempts >= MAX_POLLS) {
        setGaveUp(true);
        return;
      }
      setTimeout(tick, POLL_INTERVAL_MS);
    }

    tick();
    return () => {
      cancelled = true;
    };
  }, [folio, outcome]);

  return (
    <div data-screen-label="PagoResultado" style={{ ...wizardContainer, padding: '60px 0 100px', animation: 'lina-fade-up 0.4s ease both' }}>
      <div style={{ ...card, padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
        {renderContent({ outcome, booking, gaveUp, folio })}
        <button onClick={() => navigate('/')} style={{ ...primaryButton, marginTop: 10 }}>
          Volver al inicio
        </button>
        {outcome === 'failure' && (
          <button onClick={() => navigate('/agendar')} style={secondaryButton}>
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

function renderContent({ outcome, booking, gaveUp, folio }) {
  if (outcome === 'failure') {
    return (
      <>
        <Icon variant="error" />
        <h1 style={titleStyle}>Tu pago no se pudo procesar</h1>
        <p style={textStyle}>No se realizó ningún cargo. Puedes intentar de nuevo con otra tarjeta.</p>
      </>
    );
  }

  if (outcome === 'pending') {
    return (
      <>
        <Icon variant="pending" />
        <h1 style={titleStyle}>Tu pago está en proceso</h1>
        <p style={textStyle}>En cuanto se confirme te llega un correo con los detalles de tu reserva.</p>
      </>
    );
  }

  // outcome === 'success'
  if (booking?.status === 'confirmed') {
    return (
      <>
        <Icon variant="success" />
        <h1 style={titleStyle}>¡Pago confirmado!</h1>
        <p style={textStyle}>
          Te esperamos el {booking.dateLabel} de {booking.time}. Te mandamos un correo con el resumen completo y un
          archivo para tu calendario.
        </p>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '14px 22px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)' }}>
          Folio: {booking.folio}
        </div>
      </>
    );
  }

  if (booking?.status === 'cancelled') {
    return (
      <>
        <Icon variant="error" />
        <h1 style={titleStyle}>No pudimos confirmar tu pago</h1>
        <p style={textStyle}>Si el cargo aparece en tu cuenta, contáctanos y lo resolvemos.</p>
      </>
    );
  }

  if (gaveUp) {
    return (
      <>
        <Icon variant="pending" />
        <h1 style={titleStyle}>Tu pago se está procesando</h1>
        <p style={textStyle}>Está tardando más de lo normal, pero en cuanto se confirme te llega un correo con los detalles{folio ? ` (folio ${folio})` : ''}.</p>
      </>
    );
  }

  return (
    <>
      <Icon variant="pending" />
      <h1 style={titleStyle}>Confirmando tu pago...</h1>
      <p style={textStyle}>Esto toma solo unos segundos.</p>
    </>
  );
}

const titleStyle = { fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, margin: 0 };
const textStyle = { fontSize: 15, color: 'var(--color-text-muted-2)', maxWidth: '34ch', margin: 0 };

function Icon({ variant }) {
  const bg = variant === 'success' ? 'var(--color-primary-light)' : variant === 'error' ? 'oklch(0.93 0.02 25)' : 'var(--color-surface)';
  return (
    <div style={{ width: 60, height: 60, borderRadius: 999, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {variant === 'success' && (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.5L9.5 18L20 6" stroke="oklch(0.4 0.09 200)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {variant === 'error' && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M6 6L18 18M18 6L6 18" stroke="oklch(0.5 0.18 25)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {variant === 'pending' && (
        <div style={{ width: 12, height: 12, borderRadius: 999, background: 'var(--color-text-muted-3)' }} />
      )}
    </div>
  );
}
