import { money } from '../../utils/money';
import { ALLOW_WORKSHOP_DROPOFF } from '../../config';

export default function StepDetails({ service, sizeId, onSelectSize, qty, onInc, onDec }) {
  if (!service) return null;

  const selectedSize = service.sizes.find((z) => z.id === sizeId);
  const showWorkshopNote = !!(selectedSize && selectedSize.workshop && ALLOW_WORKSHOP_DROPOFF);
  const subtotal = selectedSize ? selectedSize.price * qty : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, margin: '0 0 6px' }}>
        Detalles de {service.name}
      </h2>
      <div style={{ fontSize: 14, fontWeight: 700 }}>Tamaño</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {service.sizes.map((sz) => {
          const isSelected = sizeId === sz.id;
          return (
            <div
              key={sz.id}
              onClick={() => onSelectSize(sz.id)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: 12,
                background: isSelected ? 'var(--color-primary-light)' : '#fff',
                border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{sz.label}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted-3)' }}>{sz.desc}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)' }}>{money(sz.price)}</div>
            </div>
          );
        })}
      </div>
      {showWorkshopNote && (
        <div style={{ fontSize: 13, color: 'var(--color-gold-tint-text)', background: 'var(--color-gold-tint)', padding: '12px 14px', borderRadius: 10 }}>
          Este tamaño se recoge y lava en nuestro centro de trabajo, y se entrega de vuelta a tu domicilio.
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Cantidad</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={onDec}
            style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--color-border-strong)', background: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
          >
            −
          </button>
          <div style={{ fontSize: 17, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</div>
          <button
            onClick={onInc}
            style={{ width: 36, height: 36, borderRadius: 999, border: '1px solid var(--color-border-strong)', background: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}
          >
            +
          </button>
        </div>
      </div>
      {selectedSize && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Subtotal</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-primary)' }}>{money(subtotal)}</div>
        </div>
      )}
    </div>
  );
}
