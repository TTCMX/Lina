import { useNavigate } from 'react-router-dom';
import { SERVICES, fromPriceLabel } from '../data/services';
import { money } from '../utils/money';
import { container, primaryButton, secondaryButton, card, photoPlaceholder, photoPlaceholderLabel } from '../styles';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div data-screen-label="Home" style={{ animation: 'lina-fade-up 0.5s ease both' }}>
      <section style={{ ...container, padding: '44px 0 8px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary-tint)',
            padding: '6px 14px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          Servicio a domicilio
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 500,
            fontSize: 'clamp(34px, 6vw, 56px)',
            lineHeight: 1.08,
            margin: '18px 0 16px',
            maxWidth: '14ch',
          }}
        >
          Tapetes, colchones y salas{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>como nuevos</em>, sin salir de casa
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--color-text-muted)', maxWidth: '46ch', margin: '0 0 26px' }}>
          Lavado profundo y profesional para el hogar. Agenda en línea en minutos, nosotros llegamos con todo el
          equipo.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 30 }}>
          <button onClick={() => navigate('/agendar')} style={primaryButton}>
            Agendar mi servicio
          </button>
          <button onClick={() => navigate('/servicios')} style={secondaryButton}>
            Ver servicios
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          {['Garantía de satisfacción', 'Productos certificados', 'Personal capacitado'].map((t) => (
            <div
              key={t}
              style={{
                background: '#fff',
                border: '1px solid var(--color-border)',
                padding: '10px 16px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-muted-2)',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...container, padding: '46px 0 10px' }}>
        <div style={photoPlaceholder('16/7')}>
          <span style={photoPlaceholderLabel}>foto: equipo trabajando en sala de cliente</span>
        </div>
      </section>

      <section style={{ ...container, padding: '54px 0 10px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 500, margin: '0 0 22px' }}>
          Nuestros servicios
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {SERVICES.map((svc) => (
            <div
              key={svc.id}
              onClick={() => navigate('/agendar', { state: { serviceId: svc.id } })}
              style={{ ...card, padding: '26px 22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary-tint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {svc.letter}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{svc.name}</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-muted-2)', lineHeight: 1.45 }}>{svc.short}</div>
              <div style={{ marginTop: 6, fontSize: 14, fontWeight: 700, color: 'var(--color-primary)' }}>
                Desde {money(fromPriceLabel(svc))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...container, padding: '54px 0 10px' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 500, margin: '0 0 22px' }}>
          Cómo funciona
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 22 }}>
          {[
            { n: 1, title: 'Agenda en línea', desc: 'Elige el servicio, tamaño, fecha y hora que mejor te acomoden.' },
            { n: 2, title: 'Vamos a tu domicilio', desc: 'Llegamos con equipo profesional a la hora acordada.' },
            { n: 3, title: 'Recibe todo limpio', desc: 'Tus tapetes, colchones o salas listos y frescos, sin moverte de casa.' },
          ].map((step) => (
            <div key={step.n} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--color-dark)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {step.n}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{step.title}</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-muted-2)', lineHeight: 1.5 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...container, padding: '54px 0 10px' }}>
        <div style={{ ...card, padding: '30px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--color-gold-tint)', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 19, lineHeight: 1.5, color: 'oklch(0.3 0.02 250)' }}>
                "Llegaron puntuales, se llevaron el tapete grande y lo regresaron el mismo día impecable."
              </div>
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted-2)' }}>Cliente de Lina</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 0 70px', background: 'var(--color-dark)', marginTop: 54 }}>
        <div style={{ ...container, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 500, margin: 0, maxWidth: '18ch' }}>
            ¿Listo para que tus tapetes vuelvan a lucir así?
          </h2>
          <button
            onClick={() => navigate('/agendar')}
            style={{
              background: 'var(--color-gold)',
              color: 'var(--color-gold-text)',
              border: 'none',
              padding: '16px 30px',
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Agendar ahora
          </button>
        </div>
      </section>
    </div>
  );
}
