import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { findService } from '../data/services';
import { getDateOptions } from '../utils/dates';
import { money } from '../utils/money';
import { isValidEmail } from '../utils/email';
import { computeDiscount } from '../utils/coupon';
import { wizardContainer } from '../styles';
import { DEFAULT_PAYMENT_TYPE, DEPOSIT_PERCENT } from '../config';
import ProgressBar from './agendar/ProgressBar';
import StepService from './agendar/StepService';
import StepDetails from './agendar/StepDetails';
import StepDateTime from './agendar/StepDateTime';
import StepAddress from './agendar/StepAddress';
import StepPayment from './agendar/StepPayment';

const EMPTY_CUSTOMER = { name: '', phone: '', email: '' };
const EMPTY_ADDRESS = { street: '', colonia: '', ciudad: '', referencias: '' };

export default function Agendar() {
  const location = useLocation();
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [takenSlots, setTakenSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  const dateOptions = useMemo(() => getDateOptions(), []);

  async function loadAvailability(date) {
    if (!date) {
      setTakenSlots([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?date=${date}`);
      const data = await res.json();
      setTakenSlots(res.ok ? data.takenSlots || [] : []);
    } catch {
      setTakenSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    loadAvailability(selectedDate);
  }, [selectedDate]);

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
  else if (step === 3) canContinue = !!selectedDate && !!selectedTime && !takenSlots.includes(selectedTime);
  else if (step === 4) canContinue = addressValid;
  else if (step === 5) canContinue = !submitting;

  const discountAmount = computeDiscount(coupon, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const depositAmount = Math.round(discountedSubtotal * (DEPOSIT_PERCENT / 100));
  const amountCharged = effectivePaymentType === 'deposit' ? depositAmount : discountedSubtotal;
  const mainButtonLabel = step === 5
    ? (submitting ? 'Conectando con Mercado Pago...' : `Ir a pagar ${money(amountCharged)}`)
    : 'Continuar';

  const handleCustomerChange = (field) => (e) => {
    const value = e.target.value;
    setCustomer((c) => ({ ...c, [field]: value }));
  };

  const handleAddressChange = (field) => (e) => {
    const value = e.target.value;
    setAddress((a) => ({ ...a, [field]: value }));
  };

  async function handleApplyCoupon(code) {
    if (!code.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/coupons/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo aplicar el cupón.');
      setCoupon({ code: data.code, type: data.type, value: data.value });
    } catch (err) {
      setCoupon(null);
      setCouponError(err.message || 'No se pudo aplicar el cupón.');
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCoupon(null);
    setCouponError(null);
  }

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
          sizeId: selectedSize.id,
          qty,
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
          couponCode: coupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setStep(3);
          setSelectedTime(null);
          loadAvailability(selectedDate);
        }
        throw new Error(data.error || 'No se pudo agendar tu servicio.');
      }
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setSubmitError(err.message || 'No se pudo agendar tu servicio. Intenta de nuevo.');
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
              takenSlots={takenSlots}
              loadingSlots={loadingSlots}
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
              coupon={coupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              couponLoading={couponLoading}
              couponError={couponError}
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
    </div>
  );
}
