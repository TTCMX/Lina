import { TIME_SLOTS } from '../../utils/dates';

export default function StepDateTime({ dateOptions, selectedDate, onSelectDate, selectedTime, onSelectTime, takenSlots, loadingSlots }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, margin: '0 0 6px' }}>
        Elige fecha y hora
      </h2>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
        {dateOptions.map((d) => {
          const isSelected = selectedDate === d.key;
          return (
            <div
              key={d.key}
              onClick={() => onSelectDate(d.key)}
              style={{
                cursor: 'pointer',
                flexShrink: 0,
                width: 60,
                padding: '12px 0',
                borderRadius: 14,
                textAlign: 'center',
                background: isSelected ? 'var(--color-primary)' : '#fff',
                border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: isSelected ? '#fff' : 'var(--color-text)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>{d.weekday}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{d.dayNum}</div>
            </div>
          );
        })}
      </div>
      {selectedDate && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Horario disponible</div>
          {loadingSlots ? (
            <div style={{ fontSize: 14, color: 'var(--color-text-muted-3)' }}>Consultando disponibilidad...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {TIME_SLOTS.map((t) => {
                const isSelected = selectedTime === t;
                const isTaken = takenSlots.includes(t);
                return (
                  <div
                    key={t}
                    onClick={isTaken ? undefined : () => onSelectTime(t)}
                    style={{
                      cursor: isTaken ? 'not-allowed' : 'pointer',
                      opacity: isTaken ? 0.45 : 1,
                      textAlign: 'center',
                      padding: '13px 8px',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      background: isSelected ? 'var(--color-primary-light)' : '#fff',
                      border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      color: isSelected ? 'var(--color-primary-tint)' : 'var(--color-text)',
                    }}
                  >
                    {t}
                    {isTaken && <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.8, marginTop: 2 }}>Ocupado</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
