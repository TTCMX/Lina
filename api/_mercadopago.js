import crypto from 'node:crypto';

const API_BASE = 'https://api.mercadopago.com';

export async function createPreference({ items, externalReference, backUrls, notificationUrl, metadata }) {
  const res = await fetch(`${API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items,
      external_reference: externalReference,
      back_urls: backUrls,
      auto_return: 'approved',
      notification_url: notificationUrl,
      metadata,
      // Card only: excludes OXXO/cash vouchers and bank transfers, which
      // settle async (hours to days) and would leave a slot reserved in
      // limbo with no way to know if it'll ever be paid.
      payment_methods: {
        excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }, { id: 'atm' }],
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Mercado Pago createPreference failed: ${res.status} ${detail}`);
  }
  return res.json();
}

export async function getPayment(paymentId) {
  const res = await fetch(`${API_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Mercado Pago getPayment failed: ${res.status} ${detail}`);
  }
  return res.json();
}

// Validates MP's webhook signature.
// x-signature: "ts=<millis>,v1=<hmac-sha256-hex>"
// manifest to sign: "id:<data.id lowercased>;request-id:<x-request-id>;ts:<ts>;"
export function verifyWebhookSignature({ xSignature, xRequestId, dataId }) {
  if (!xSignature || !xRequestId || !dataId) return false;

  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k?.trim(), v?.trim()];
    })
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update(manifest).digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const gotBuf = Buffer.from(v1, 'hex');
  if (expectedBuf.length !== gotBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, gotBuf);
}
