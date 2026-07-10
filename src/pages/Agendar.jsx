import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { findService } from '../data/services';
import { getDateOptions } from '../utils/dates';
import { money } from '../utils/money';
import { isValidEmail } from '../utils/email';
import { wizardContainer } from '../styles';
import { DEFAULT_PAYMENT_TYPE, DEPOSIT_PERCENT } from '../config';
import ProgressBar from './agendar/ProgressBar';
import StepService from './agendar/StepService';
import StepDetails from './agendar/StepDetails';
import StepDateTime from './agendar/StepDateTime';
import StepAddress from './agendar/StepAddress';
import StepPayment from './agendar/StepPayment';
import Confirmation from './agendar/Confirmation';

const EMPTY_CUSTOMER = { name: '', phone: '', email: '' };
const EMPTY_ADDRESS = { street: '', colonia: '', ciudad: '', referencias: '' };
const EMPTY_CARD = { number: '', exp: '', cvc: '', name: '' };

export default function Agendar() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialServiceId = location.state?.serviceId ?? null;

  const [step, setStep] = useState(initialServiceId ? 2 : 1);
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [sizeId, setSizeId] = useState(null);
  const [qty, setQty] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [paymentType, setPaymentType] = useState(null);
  const [card, setCard] = useState(EMPTY_CARD);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const dateOptions = useMemo(() => getDateOptions(), []);

  const service = findService(serviceId);
  const selectedSize = service ? service.sizes.find((z) => z.id === sizeId) : null;
  const subtotal = selectedSize ? selectedSize.price * qty : 0;
  const selectedDateObj = dateOptions.find((d) => d.key === selectedDate);
  const selectedDateLabel = selectedDateObj ? `${selectedDateObj.weekday} ${selectedDateObj.dayNum} ${selectedDateObj.month}` : '';

  const effectivePaymentType = paymentType || DEFAULT_PAYMENT_TYPE;

  const customerValid = customer.name.trim().length > 1 && customer.phone.trim().length >= 8 && isValidEmail(customer.email);
  const addressValid = customerValid && address.street.trim().length > 2 && address.colonia.trim().length > 1 && address.ciudad.trim().length > 1;

  let canContinue = false;
  if (step === 1) canContinue = !!serviceId;
  else if (step === 2) canContinue = !!sizeId;
  else if (step === 3) canContinue = !!selectedDate && !!selectedTime;
  else if (step === 4) canContinue = addressValid;
  else if (step === 5) canContinue = !submitting;

  const depositAmount = Math.round(subtotal * (DEPOSIT_PERCENT / 100));
  const amountCharged = effectivePaymentType === 'deposit' ? depositAmount : subtotal;
  const mainButtonLabel = step === 5
    ? (submitting ? 'Enviando...' : `Confirmar y pagar ${money(amountCharged)}`)
    : 'Continuar';

  const handleCustomerChange = (field) => (e) => {
    const value = e.target.value;
    setCustomer((c) => ({ ...c, [field]: value }));
  };

  const handleAddressChange = (field) => (e) => {
    const value = e.target.value;
    setAddress((a) => ({ ...a, [field]: value }));
  };

  const handleCardChange = (field) => (e) => {
    const value = e.target.value;
    setCard((c) => ({ ...c, [field]: value }));
  };

  async function handleNext() {
    if (step < 5) {
      setStep(step + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          sizeId: selectedSize.id,
          sizeLabel: selectedSize.label,
          qty,
          unitPrice: selectedSize.price,
          subtotal,
          date: selectedDate,
          dateLabel: selectedDateLabel,
          time: selectedTime,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          street: address.street,
          colonia: address.colonia,
          ciudad: address.ciudad,
          referencias: address.referencias,
          paymentType: effectivePaymentType,
          amountCharged,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo agendar tu servicio.');
      setBookingId(data.folio);
      setConfirmed(true);
    } catch (err) {
      setSubmitError(err.message || 'No se pudo agendar tu servicio. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  function handlePrev() {
    setStep((s) => Math.max(1, s - 1));
  }

  function handleSelectService(id) {
    setServiceId(id);
    setSizeId(null);
  }

  function handleSelectSize(id) {
    setSizeId(id);
  }

  return (
    <div data-screen-label="Agendar" style={{ ...wizardContainer, padding: '30px 0 120px', animation: 'lina-fade-up 0.4s ease both' }}>
      {!confirmed ? (
        <div>
          <div>
            <ProgressBar step={step} />

            {step === 1 && <StepService serviceId={serviceId} onSelect={handleSelectService} />}

            {step === 2 && (
              <StepDetails
                service={service}
                sizeId={sizeId}
                onSelectSize={handleSelectSize}
                qty={qty}
                onInc={() => setQty((q) => Math.min(10, q + 1))}
                onDec={() => setQty((q) => Math.max(1, q - 1))}
              />
            )}

            {step === 3 && (
              <StepDateTime
                dateOptions={dateOptions}
                selectedDate={selectedDate}
                onSelectDate={(key) => {
                  setSelectedDate(key);
                  setSelectedTime(null);
                }}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            )}

            {step === 4 && (
              <StepAddress
                customer={customer}
                onCustomerChange={handleCustomerChange}
                address={address}
                onChange={handleAddressChange}
              />
            )}

            {step === 5 && (
              <StepPayment
                summary={{
                  customerName: customer.name,
                  customerPhone: customer.phone,
                  serviceName: service ? service.name : '',
                  sizeLabel: selectedSize ? selectedSize.label : '',
                  qty,
                  dateLabel: selectedDateLabel,
                  time: selectedTime,
                  street: address.street,
                  colonia: address.colonia,
                  subtotal,
                }}
                paymentType={effectivePaymentType}
                onSelectDeposit={() => setPaymentType('deposit')}
                onSelectFull={() => setPaymentType('full')}
                card={card}
                onCardChange={handleCardChange}
              />
            )}

            {submitError && (
              <div style={{ marginTop: 16, fontSize: 14, color: 'oklch(0.5 0.18 25)', background: 'oklch(0.96 0.03 25)', padding: '12px 14px', borderRadius: 10 }}>
                {submitError}
              </div>
            )}
          </div>

          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'oklch(0.99 0.004 85 / 0.95)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid var(--color-border)',
              padding: '14px min(3vw, 20px)',
              zIndex: 30,
            }}
          >
            <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', gap: 12 }}>
              {step > 1 && (
                <button
                  onClick={handlePrev}
                  disabled={submitting}
                  style={{ background: 'none', border: '1px solid var(--color-border-strong)', padding: '15px 22px', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  Atrás
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canContinue}
                style={{
                  flex: 1,
                  background: canContinue ? 'var(--color-primary)' : 'var(--color-border-strong)',
                  color: '#fff',
                  border: 'none',
                  padding: '15px 22px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: canContinue ? 'pointer' : 'not-allowed',
                }}
              >
                {mainButtonLabel}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Confirmation
          dateLabel={selectedDateLabel}
          time={selectedTime}
          bookingId={bookingId}
          onBackHome={() => navigate('/')}
        />
      )}
    </div>
  );
}
