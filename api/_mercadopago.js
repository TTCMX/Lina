import crypto from 'node:crypto';

const API_BASE = 'https://api.mercadopago.com';

// Trim defensively: a stray trailing newline/space from copy-pasting into
// Vercel's env var UI is a common source of "works nowhere" bugs — it
// silently changes the HMAC key or bearer token without any visible error.
function mpAccessToken() {
  return (process.env.MP_ACCESS_TOKEN || '').trim();
}

function mpWebhookSecret() {
  return (process.env.MP_WEBHOOK_SECRET || '').trim();
}

export async function createPreference({ items, externalReference, backUrls, metadata }) {
  const res = await fetch(`${API_BASE}/checkout/preferences`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mpAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items,
      external_reference: externalReference,
      back_urls: backUrls,
      auto_return: 'approved',
      // Deliberately no notification_url here: setting it per-preference
      // triggers Mercado Pago's legacy IPN delivery (topic/id in the query
      // string), which MP's own docs say can't be reliably validated via
      // the webhook secret even though it still sends an x-signature
      // header. Relying solely on the dashboard-configured Webhooks
      // subscription gets the newer type/data.id JSON format instead,
      // which the signature check in verifyWebhookSignature() is built for.
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
    headers: { Authorization: `Bearer ${mpAccessToken()}` },
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

  const secret = mpWebhookSecret();
  if (!secret) {
    console.error('[mp-webhook] MP_WEBHOOK_SECRET is empty/unset');
    return false;
  }
  if (secret !== process.env.MP_WEBHOOK_SECRET) {
    console.warn('[mp-webhook] MP_WEBHOOK_SECRET had leading/trailing whitespace — trimmed before use');
  }

  const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  const expectedBuf = Buffer.from(expected, 'hex');
  const gotBuf = Buffer.from(v1, 'hex');
  if (expectedBuf.length !== gotBuf.length) {
    console.error('[mp-webhook] signature length mismatch', { expectedLen: expectedBuf.length, gotLen: gotBuf.length, manifest });
    return false;
  }
  const matches = crypto.timingSafeEqual(expectedBuf, gotBuf);
  if (!matches) {
    console.error('[mp-webhook] signature mismatch', { manifest, secretLength: secret.length });
  }
  return matches;
}
