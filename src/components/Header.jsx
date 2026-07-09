import { useNavigate } from 'react-router-dom';
import { container } from '../styles';

const navLinkStyle = {
  textAlign: 'left',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid oklch(0.93 0.01 250)',
  padding: '14px 4px',
  fontSize: 17,
  fontWeight: 600,
  color: 'var(--color-text)',
  cursor: 'pointer',
};

export default function Header({ menuOpen, onToggleMenu }) {
  const navigate = useNavigate();

  const go = (path) => {
    navigate(path);
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'oklch(0.99 0.004 85 / 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          ...container,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 0',
          gap: 12,
        }}
      >
        <div
          onClick={() => go('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--color-gold)' }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 600, letterSpacing: 0.3 }}>
            Lina
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => go('/agendar')}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Agendar
          </button>
          <button
            onClick={onToggleMenu}
            aria-label="Menú"
            style={{
              background: 'none',
              border: '1px solid var(--color-border-strong)',
              width: 42,
              height: 42,
              borderRadius: 999,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <span style={{ width: 18, height: 2, background: 'var(--color-text)', borderRadius: 2 }} />
            <span style={{ width: 18, height: 2, background: 'var(--color-text)', borderRadius: 2 }} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '8px min(3vw, 20px) 18px' }}>
          <div style={{ ...container, display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => go('/')} style={navLinkStyle}>Inicio</button>
            <button onClick={() => go('/servicios')} style={navLinkStyle}>Servicios</button>
            <button onClick={() => go('/nosotros')} style={navLinkStyle}>Nosotros</button>
            <button onClick={() => go('/contacto')} style={{ ...navLinkStyle, borderBottom: 'none' }}>Contacto</button>
          </div>
        </div>
      )}
    </header>
  );
}
