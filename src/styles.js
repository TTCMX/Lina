export const container = {
  maxWidth: 'min(1100px, 94vw)',
  margin: '0 auto',
};

export const wizardContainer = {
  maxWidth: 'min(560px, 94vw)',
  margin: '0 auto',
};

export const card = {
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: 18,
};

export const eyebrow = {
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--color-primary)',
  letterSpacing: 0.3,
  textTransform: 'uppercase',
};

export const primaryButton = {
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  padding: '16px 26px',
  borderRadius: 14,
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
};

export const secondaryButton = {
  background: 'none',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border-strong)',
  padding: '16px 26px',
  borderRadius: 14,
  fontWeight: 700,
  fontSize: 16,
  cursor: 'pointer',
};

export const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 10,
  border: '1px solid var(--color-border-strong)',
  fontSize: 15,
};

export const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  display: 'block',
  marginBottom: 6,
};

export const photoPlaceholder = (aspectRatio) => ({
  width: '100%',
  aspectRatio,
  borderRadius: 20,
  background:
    'repeating-linear-gradient(115deg, oklch(0.93 0.02 200), oklch(0.93 0.02 200) 12px, oklch(0.9 0.02 200) 12px, oklch(0.9 0.02 200) 24px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const photoPlaceholderLabel = {
  fontFamily: 'monospace',
  fontSize: 13,
  color: 'oklch(0.4 0.02 200)',
  background: 'oklch(0.99 0.004 85 / 0.85)',
  padding: '6px 14px',
  borderRadius: 999,
};
