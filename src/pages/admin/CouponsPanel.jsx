import { useEffect, useState } from 'react';
import { inputStyle, labelStyle } from '../../styles';
import { money } from '../../utils/money';

const EMPTY_FORM = { code: '', type: 'percent', value: '', maxUses: '', expiresAt: '', minSubtotal: '' };

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudieron cargar los cupones.');
      setCoupons(data.coupons);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          maxUses: form.maxUses || null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
          minSubtotal: form.minSubtotal || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el cupón.');
      setCoupons((prev) => [data.coupon, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(coupon) {
    try {
      const res = await fetch(`/api/admin/coupons?id=${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !coupon.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el cupón.');
      setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? data.coupon : c)));
    } catch (err) {
      setError(err.message);
    }
  }

  const valid = form.code.trim().length > 1 && Number(form.value) > 0;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setShowForm((s) => !s)} style={toggleFormButtonStyle}>
          {showForm ? 'Cancelar' : '+ Nuevo cupón'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 14, padding: 18, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div>
              <label style={labelStyle}>Código</label>
              <input value={form.code} onChange={setField('code')} placeholder="VERANO10" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={form.type} onChange={setField('type')} style={inputStyle}>
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Valor</label>
              <input value={form.value} onChange={setField('value')} placeholder={form.type === 'percent' ? '10' : '100'} type="number" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <div>
              <label style={labelStyle}>Usos máximos (opcional)</label>
              <input value={form.maxUses} onChange={setField('maxUses')} placeholder="Sin límite" type="number" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Expira (opcional)</label>
              <input value={form.expiresAt} onChange={setField('expiresAt')} type="date" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Compra mínima (opcional)</label>
              <input value={form.minSubtotal} onChange={setField('minSubtotal')} placeholder="Sin mínimo" type="number" style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={!valid || creating} style={{ ...toggleFormButtonStyle, background: 'var(--color-primary)', color: '#fff', border: 'none', opacity: !valid || creating ? 0.6 : 1, alignSelf: 'flex-start' }}>
            {creating ? 'Creando...' : 'Crear cupón'}
          </button>
        </form>
      )}

      {error && (
        <div style={{ marginBottom: 16, fontSize: 14, color: 'oklch(0.5 0.18 25)', background: 'oklch(0.96 0.03 25)', padding: '12px 14px', borderRadius: 10 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--color-text-muted-3)' }}>Cargando...</div>
      ) : coupons.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted-3)' }}>No hay cupones todavía.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coupons.map((c) => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{c.code}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted-2)' }}>
                  {c.type === 'percent' ? `${c.value}% de descuento` : `${money(c.value)} de descuento`}
                  {c.min_subtotal ? ` · mínimo ${money(c.min_subtotal)}` : ''}
                  {c.expires_at ? ` · expira ${new Date(c.expires_at).toLocaleDateString('es-MX')}` : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted-3)', marginTop: 2 }}>
                  Usado {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ''} veces
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: c.active ? 'var(--color-primary-light)' : 'oklch(0.93 0.02 25)', color: c.active ? 'var(--color-primary-tint)' : 'oklch(0.45 0.15 25)' }}>
                  {c.active ? 'Activo' : 'Inactivo'}
                </div>
                <button onClick={() => handleToggle(c)} style={toggleFormButtonStyle}>
                  {c.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const toggleFormButtonStyle = {
  padding: '9px 16px',
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  border: '1px solid var(--color-border-strong)',
  background: '#fff',
  color: 'var(--color-text)',
};
