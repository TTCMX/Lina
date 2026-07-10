import { inputStyle, labelStyle } from '../../styles';

export default function StepAddress({ customer, onCustomerChange, address, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, margin: '0 0 6px' }}>
        Tus datos y dirección
      </h2>
      <div>
        <label style={labelStyle}>Nombre completo</label>
        <input value={customer.name} onChange={onCustomerChange('name')} placeholder="Tu nombre" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Teléfono</label>
        <input value={customer.phone} onChange={onCustomerChange('phone')} placeholder="10 dígitos" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Correo</label>
        <input type="email" value={customer.email} onChange={onCustomerChange('email')} placeholder="tucorreo@ejemplo.com" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>Calle y número</label>
        <input value={address.street} onChange={onChange('street')} placeholder="Ej. Av. Reforma 123" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Colonia</label>
          <input value={address.colonia} onChange={onChange('colonia')} placeholder="Colonia" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Ciudad</label>
          <input value={address.ciudad} onChange={onChange('ciudad')} placeholder="Ciudad" style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Referencias (opcional)</label>
        <textarea
          value={address.referencias}
          onChange={onChange('referencias')}
          placeholder="Color de fachada, entre calles, etc."
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>
    </div>
  );
}
