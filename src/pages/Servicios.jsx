import { useNavigate } from 'react-router-dom';
import { SERVICES } from '../data/services';
import { money } from '../utils/money';
import { container, eyebrow, card } from '../styles';

export default function Servicios() {
  const navigate = useNavigate();

  return (
    <div data-screen-label="Servicios" style={{ ...container, padding: '44px 0 70px', animation: 'lina-fade-up 0.5s ease both' }}>
      <div style={eyebrow}>Servicios</div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(30px, 5vw, 42px)', margin: '10px 0 34px' }}>
        Lavado profesional, a domicilio
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {SERVICES.map((svc) => (
          <div key={svc.id} style={{ ...card, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 999,
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 22,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {svc.letter}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{svc.name}</div>
                <div style={{ fontSize: 14, color: 'var(--color-text-muted-2)' }}>{svc.short}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
              {svc.sizes.map((sz) => (
                <div key={sz.id} style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 14, background: 'var(--color-surface)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{sz.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted-3)', margin: '2px 0 8px' }}>{sz.desc}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-primary)' }}>{money(sz.price)}</div>
                </div>
              ))}
            </div>
            {svc.workshopNote && (
              <div style={{ fontSize: 13, color: 'var(--color-text-muted-3)', background: 'var(--color-gold-tint)', padding: '10px 14px', borderRadius: 10 }}>
                {svc.workshopNote}
              </div>
            )}
            <button
              onClick={() => navigate('/agendar', { state: { serviceId: svc.id } })}
              style={{
                alignSelf: 'flex-start',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '12px 22px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Agendar este servicio
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 26, background: 'var(--color-primary-light)', borderRadius: 16, padding: '20px 22px', fontSize: 14, color: 'oklch(0.35 0.06 200)', lineHeight: 1.5 }}>
        Todos los servicios incluyen recolección y entrega a domicilio. Algunos tapetes de gran formato se lavan en
        nuestro centro de trabajo para un mejor resultado.
      </div>
    </div>
  );
}
