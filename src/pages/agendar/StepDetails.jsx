import { money } from '../../utils/money';
import { ALLOW_WORKSHOP_DROPOFF } from '../../config';
import { EXTRAS, unitSuffix, applicationsFor } from '../../data/services';

export default function StepDetails({ service, sizeId, onSelectSize, qty, onInc, onDec, extras, onToggleExtra }) {
  if (!service) return null;

  const selectedSize = service.sizes.find((z) => z.id === sizeId);
  const showWorkshopNote = !!(
    ALLOW_WORKSHOP_DROPOFF && service.workshopThreshold && qty > service.workshopThreshold
  );
  const serviceSubtotal = selectedSize ? selectedSize.price * qty : 0;
  const applications = applicationsFor(qty);
  const extrasAmount = extras.reduce((sum, id) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return sum + (extra ? extra.price * applications : 0);
  }, 0);
  const subtotal = serviceSubtotal + extrasAmount;
  const optionLabel = service.unit === 'servicio' ? 'Tamaño' : 'Material';
  const suffix = unitSuffix(service.unit);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, margin: '0 0 6px' }}>
        Detalles de {service.name}
      </h2>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{optionLabel}</div>
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
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-primary)' }}>
                {money(sz.price)}
                {suffix}
              </div>
            </div>
          );
        })}
      </div>
      {showWorkshopNote && (
        <div style={{ fontSize: 13, color: 'var(--color-gold-tint-text)', background: 'var(--color-gold-tint)', padding: '12px 14px', borderRadius: 10 }}>
          {service.workshopNote}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{service.qtyLabel}</div>
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

      <div style={{ paddingTop: 6, borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Extras (opcional)</div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted-3)', marginBottom: 10 }}>
          Cada aplicación cubre hasta 3 {service.unit === 'plaza' ? 'plazas' : 'm²'}; si tu servicio es más grande, se
          cobran las aplicaciones necesarias automáticamente.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {EXTRAS.map((extra) => {
            const checked = extras.includes(extra.id);
            const amount = extra.price * applications;
            return (
              <label
                key={extra.id}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: checked ? 'var(--color-primary-light)' : '#fff',
                  border: `1.5px solid ${checked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" checked={checked} onChange={() => onToggleExtra(extra.id)} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{extra.label}</span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)' }}>
                  {money(amount)}
                  {applications > 1 && <span style={{ fontWeight: 500, color: 'var(--color-text-muted-3)' }}> ({applications}x)</span>}
                </span>
              </label>
            );
          })}
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
