import { useState } from 'react';
import { container, eyebrow, card, inputStyle, labelStyle } from '../styles';

const INFO = [
  { label: 'WhatsApp / Teléfono', value: '+52 55 0000 0000' },
  { label: 'Correo', value: 'hola@lina.mx' },
  { label: 'Horario', value: 'Lun a sáb, 9:00–19:00' },
  { label: 'Zona de cobertura', value: 'Zona metropolitana' },
];

export default function Contacto() {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const valid = form.name.trim().length > 1 && form.phone.trim().length >= 8;

  return (
    <div data-screen-label="Contacto" style={{ ...container, padding: '44px 0 70px', animation: 'lina-fade-up 0.5s ease both' }}>
      <div style={eyebrow}>Contacto</div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(30px, 5vw, 42px)', margin: '10px 0 30px' }}>
        Hablemos
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {INFO.map((item) => (
            <div key={item.label} style={{ ...card, borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3, color: 'var(--color-text-muted-3)' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ ...card, padding: 26 }}>
          {submitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10, padding: '30px 0', animation: 'lina-pop 0.4s ease both' }}>
              <div style={{ width: 54, height: 54, borderRadius: 999, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12.5L9.5 18L20 6" stroke="oklch(0.4 0.09 200)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>¡Mensaje enviado!</div>
              <div style={{ fontSize: 14, color: 'var(--color-text-muted-2)' }}>Te responderemos muy pronto.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input value={form.name} onChange={setField('name')} placeholder="Tu nombre" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input value={form.phone} onChange={setField('phone')} placeholder="10 dígitos" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Mensaje</label>
                <textarea value={form.message} onChange={setField('message')} placeholder="¿En qué te ayudamos?" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <button
                onClick={() => setSubmitted(true)}
                disabled={!valid}
                style={{
                  background: valid ? 'var(--color-primary)' : 'var(--color-border-strong)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 22px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: valid ? 'pointer' : 'not-allowed',
                }}
              >
                Enviar mensaje
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
