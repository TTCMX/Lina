import { useNavigate } from 'react-router-dom';
import { container, eyebrow, primaryButton, photoPlaceholder, photoPlaceholderLabel } from '../styles';

const VALUES = [
  { title: 'Confianza', desc: 'Personal capacitado e identificado en cada visita a tu domicilio.' },
  { title: 'Cuidado', desc: 'Productos certificados, seguros para niños, mascotas y materiales delicados.' },
  { title: 'Comodidad', desc: 'Agenda, paga y da seguimiento a tu servicio desde el celular.' },
];

export default function Nosotros() {
  const navigate = useNavigate();

  return (
    <div data-screen-label="Nosotros" style={{ ...container, padding: '44px 0 70px', animation: 'lina-fade-up 0.5s ease both' }}>
      <div style={eyebrow}>Nosotros</div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, fontSize: 'clamp(30px, 5vw, 42px)', margin: '10px 0 20px', maxWidth: '16ch' }}>
        Cuidamos tu hogar como si fuera el nuestro
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 34px' }}>
        Lina nació para resolver algo simple: llevar un lavado profundo y profesional hasta la puerta de tu casa,
        sin que tengas que cargar nada ni preocuparte por el proceso.
      </p>

      <div style={{ ...photoPlaceholder('16/8'), marginBottom: 40 }}>
        <span style={photoPlaceholderLabel}>foto: equipo Lina</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 46 }}>
        {VALUES.map((v) => (
          <div key={v.title}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, marginBottom: 8 }}>{v.title}</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-muted-2)', lineHeight: 1.55 }}>{v.desc}</div>
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/agendar')} style={primaryButton}>
        Agendar mi servicio
      </button>
    </div>
  );
}
