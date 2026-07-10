import { money } from '../../utils/money';
import { card } from '../../styles';
import { DEPOSIT_PERCENT } from '../../config';

export default function StepPayment({ summary, paymentType, onSelectDeposit, onSelectFull }) {
  const isDeposit = paymentType === 'deposit';
  const isFull = paymentType === 'full';
  const depositAmount = Math.round(summary.subtotal * (DEPOSIT_PERCENT / 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, margin: '0 0 6px' }}>
        Resumen y pago
      </h2>

      <div style={{ ...card, borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Row label="Cliente" value={`${summary.customerName} · ${summary.customerPhone}`} alignRight />
        <Row label="Servicio" value={`${summary.serviceName} · ${summary.sizeLabel}`} />
        <Row label="Cantidad" value={summary.qty} />
        <Row label="Fecha" value={`${summary.dateLabel}, ${summary.time}`} />
        <Row label="Dirección" value={`${summary.street}, ${summary.colonia}`} alignRight />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--color-border)', fontSize: 16 }}>
          <span style={{ fontWeight: 700 }}>Total</span>
          <span style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{money(summary.subtotal)}</span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Forma de pago</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div
            onClick={onSelectDeposit}
            style={{
              cursor: 'pointer',
              padding: 14,
              borderRadius: 12,
              background: isDeposit ? 'var(--color-primary-light)' : '#fff',
              border: `1.5px solid ${isDeposit ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700 }}>Depósito ({DEPOSIT_PERCENT}%)</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted-3)', marginTop: 2 }}>Resto al terminar</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-primary)', marginTop: 8 }}>{money(depositAmount)}</div>
          </div>
          <div
            onClick={onSelectFull}
            style={{
              cursor: 'pointer',
              padding: 14,
              borderRadius: 12,
              background: isFull ? 'var(--color-primary-light)' : '#fff',
              border: `1.5px solid ${isFull ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700 }}>Pago completo</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted-3)', marginTop: 2 }}>Todo por adelantado</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-primary)', marginTop: 8 }}>{money(summary.subtotal)}</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--color-text-muted-3)', background: 'var(--color-surface)', padding: '12px 14px', borderRadius: 10, lineHeight: 1.5 }}>
        Al confirmar, te llevamos a Mercado Pago para completar el pago con tarjeta de forma segura. Volverás a Lina automáticamente cuando termines.
      </div>
    </div>
  );
}

function Row({ label, value, alignRight }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: 'var(--color-text-muted-3)' }}>{label}</span>
      <span style={{ fontWeight: 700, textAlign: alignRight ? 'right' : undefined, maxWidth: alignRight ? '60%' : undefined }}>{value}</span>
    </div>
  );
}
