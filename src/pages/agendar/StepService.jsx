import { SERVICES, fromPriceLabel } from '../../data/services';
import { money } from '../../utils/money';

export default function StepService({ serviceId, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, margin: '0 0 6px' }}>
        ¿Qué necesitas lavar?
      </h2>
      {SERVICES.map((svc) => {
        const isSelected = serviceId === svc.id;
        return (
          <div
            key={svc.id}
            onClick={() => onSelect(svc.id)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 18px',
              borderRadius: 14,
              background: isSelected ? 'var(--color-primary-light)' : '#fff',
              border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: '#fff',
                color: 'var(--color-primary-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-serif)',
                fontSize: 19,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {svc.letter}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{svc.name}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted-3)' }}>Desde {money(fromPriceLabel(svc))}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
