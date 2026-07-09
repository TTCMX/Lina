import { useNavigate } from 'react-router-dom';

export default function Fab() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/agendar')}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 35,
        background: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        padding: '15px 22px',
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 14,
        boxShadow: '0 8px 24px oklch(0.4 0.09 200 / 0.35)',
        cursor: 'pointer',
      }}
    >
      Agendar
    </button>
  );
}
