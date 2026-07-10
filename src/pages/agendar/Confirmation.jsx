import { buildGoogleCalendarUrl, buildIcsContent } from '../../utils/ics';
import { secondaryButton } from '../../styles';

export default function Confirmation({ dateISO, dateLabel, time, bookingId, serviceName, sizeLabel, street, colonia, ciudad, onBackHome }) {
  const location = `${street}, ${colonia}, ${ciudad}`;
  const title = `Lina — ${serviceName} (${sizeLabel})`;
  const description = `Folio: ${bookingId}. Servicio de ${serviceName} (${sizeLabel}) con Lina.`;
  const googleUrl = buildGoogleCalendarUrl({ dateISO, time, title, details: description, location });

  function handleDownloadIcs() {
    const content = buildIcsContent({ uid: bookingId, dateISO, time, summary: title, description, location });
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lina-${bookingId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '40px 10px', animation: 'lina-pop 0.45s ease both' }}>
      <div style={{ width: 68, height: 68, borderRadius: 999, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.5L9.5 18L20 6" stroke="oklch(0.4 0.09 200)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 500, margin: 0 }}>¡Servicio agendado!</h2>
      <p style={{ fontSize: 15, color: 'var(--color-text-muted-2)', maxWidth: '34ch', margin: 0 }}>
        Te esperamos el {dateLabel} de {time}. Te enviaremos un recordatorio antes de la visita.
      </p>
      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 14, padding: '16px 22px', fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)', marginTop: 8 }}>
        Folio: {bookingId}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 10 }}>
        <a
          href={googleUrl}
          target="_blank"
          rel="noreferrer"
          style={{ ...secondaryButton, padding: '13px 20px', fontSize: 14, textDecoration: 'none', display: 'inline-block' }}
        >
          Agregar a Google Calendar
        </a>
        <button onClick={handleDownloadIcs} style={{ ...secondaryButton, padding: '13px 20px', fontSize: 14 }}>
          Descargar .ics
        </button>
      </div>

      <button
        onClick={onBackHome}
        style={{ marginTop: 14, background: 'var(--color-dark)', color: '#fff', border: 'none', padding: '15px 26px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
      >
        Volver al inicio
      </button>
    </div>
  );
}
