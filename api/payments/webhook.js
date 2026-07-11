import { verifyWebhookSignature } from '../_mercadopago.js';
import { confirmPaymentById } from '../_confirm.js';

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

// Mercado Pago has sent notifications in more than one shape over the
// years: the current one is a POST with a JSON body ({ type, data: { id } }),
// but some notifications (retries, the dashboard's "simulate" button, the
// legacy IPN format) arrive as query params instead (?data.id=X&type=payment
// or the older ?topic=payment&id=X). Check both so a shape mismatch doesn't
// silently swallow the notification.
function extractEvent(req) {
  const body = parseBody(req);
  const query = req.query || {};

  const dataId = body?.data?.id || query['data.id'] || query.id || null;
  let type = body?.type || query.type || null;
  if (!type && query.topic === 'payment') type = 'payment';

  return { dataId, type, body };
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dataId, type, body } = extractEvent(req);

  console.log('[mp-webhook] incoming', {
    method: req.method,
    query: req.query,
    bodyType: typeof req.body,
    bodyKeys: body && typeof body === 'object' ? Object.keys(body) : null,
    resolvedType: type,
    resolvedDataId: dataId,
    hasSignatureHeader: !!req.headers['x-signature'],
    hasRequestIdHeader: !!req.headers['x-request-id'],
  });

  if (type !== 'payment') {
    console.log('[mp-webhook] ignoring non-payment event', { type });
    return res.status(200).json({ ok: true });
  }

  if (!dataId) {
    console.error('[mp-webhook] payment event with no resolvable data id, ignoring', { body, query: req.query });
    return res.status(200).json({ ok: true });
  }

  const valid = verifyWebhookSignature({
    xSignature: req.headers['x-signature'],
    xRequestId: req.headers['x-request-id'],
    dataId,
  });
  if (!valid) {
    console.error('[mp-webhook] rejected: invalid signature', {
      dataId,
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
    });
    return res.status(401).json({ error: 'Firma inválida' });
  }

  try {
    const result = await confirmPaymentById(dataId);
    console.log('[mp-webhook] processed', { dataId, resultStatus: result?.status, folio: result?.folio });
  } catch (err) {
    console.error('[mp-webhook] failed to confirm payment:', err);
    return res.status(500).json({ error: 'No se pudo actualizar la reserva.' });
  }

  return res.status(200).json({ ok: true });
}
