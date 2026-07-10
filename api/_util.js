function supabaseBaseUrl() {
  return (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
}

export async function insertRow(table, row, { returning = false } = {}) {
  const url = `${supabaseBaseUrl()}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: returning ? 'return=representation' : 'return=minimal',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`Supabase insert into ${table} failed (url=${url}): ${res.status} ${detail}`);
    err.status = res.status;
    throw err;
  }
  return returning ? res.json() : undefined;
}

export async function queryRows(table, params) {
  const qs = new URLSearchParams(params).toString();
  const url = `${supabaseBaseUrl()}/rest/v1/${table}?${qs}`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Supabase query on ${table} failed (url=${url}): ${res.status} ${detail}`);
  }
  return res.json();
}

export async function patchRow(table, filterParams, patch) {
  const qs = new URLSearchParams(filterParams).toString();
  const url = `${supabaseBaseUrl()}/rest/v1/${table}?${qs}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`Supabase patch on ${table} failed (url=${url}): ${res.status} ${detail}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function callRpc(fnName, args) {
  const url = `${supabaseBaseUrl()}/rest/v1/rpc/${fnName}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    let message = null;
    try {
      message = JSON.parse(detail).message;
    } catch {
      // not JSON, leave message null
    }
    const err = new Error(`Supabase RPC ${fnName} failed: ${res.status} ${detail}`);
    err.status = res.status;
    err.pgMessage = message;
    throw err;
  }
  return res.json();
}

export async function sendEmail({ to, subject, text, html, attachments }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Lina <${process.env.NOTIFY_FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      ...(html ? { html } : {}),
      ...(attachments ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend send failed: ${res.status} ${detail}`);
  }
}

export async function sendManagerNotification({ subject, text, html }) {
  return sendEmail({
    to: process.env.NOTIFY_TO_EMAIL.split(',').map((s) => s.trim()),
    subject,
    text,
    html,
  });
}

export function requireFields(body, fields) {
  for (const field of fields) {
    const value = body?.[field];
    if (value === undefined || value === null || value === '') {
      return field;
    }
  }
  return null;
}
