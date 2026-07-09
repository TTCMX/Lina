const STEP_TITLES = { 1: 'Servicio', 2: 'Detalles', 3: 'Fecha y hora', 4: 'Dirección', 5: 'Pago' };

export default function ProgressBar({ step }) {
  const progressPercent = Math.round(((step - 1) / 4) * 100);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted-2)' }}>Paso {step} de 5</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{STEP_TITLES[step]}</div>
      </div>
      <div style={{ height: 6, background: 'oklch(0.92 0.01 250)', borderRadius: 999, overflow: 'hidden', marginBottom: 26 }}>
        <div
          style={{
            height: '100%',
            borderRadius: 999,
            background: 'var(--color-primary)',
            width: `${progressPercent}%`,
            transition: 'width 0.35s ease',
          }}
        />
      </div>
    </>
  );
}
