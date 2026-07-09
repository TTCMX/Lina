import { useNavigate } from 'react-router-dom';
import { container } from '../styles';

const linkStyle = {
  background: 'none',
  border: 'none',
  textAlign: 'left',
  padding: 0,
  fontSize: 14,
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  cursor: 'pointer',
};

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', padding: '40px 0 100px', background: '#fff' }}>
      <div style={{ ...container, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--color-gold)' }} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600 }}>Lina</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted-3)' }}>Lavado profesional a domicilio</div>
        </div>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => navigate('/servicios')} style={linkStyle}>Servicios</button>
            <button onClick={() => navigate('/nosotros')} style={linkStyle}>Nosotros</button>
            <button onClick={() => navigate('/contacto')} style={linkStyle}>Contacto</button>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted-3)', lineHeight: 1.8 }}>
            +52 55 0000 0000
            <br />
            hola@lina.mx
          </div>
        </div>
      </div>
    </footer>
  );
}
