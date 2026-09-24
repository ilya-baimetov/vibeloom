import { syncContact, syncPendingContacts } from './notion.js';

const MAX_BODY_BYTES = 32768;
const RATE_WINDOW_SECONDS = 600;

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(value, status = 200, headers = {}) {
  return Response.json(value, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  });
}

async function readPayload(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    throw new RequestError(415, 'Please submit using the contact form.');
  }
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    throw new RequestError(413, 'Your request is too long. Please shorten your comment.');
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'Please enter your name and email.');
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new RequestError(413, 'Your request is too long. Please shorten your comment.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let data;
  try { data = JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new RequestError(400, 'Invalid request. Please try again.'); }
  if (!data || Array.isArray(data) || typeof data !== 'object') {
    throw new RequestError(400, 'Invalid request. Please try again.');
  }
  if (data.website) throw new RequestError(400, 'Unable to submit this request.');
  if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 120 || /[\x00-\x1f\x7f]/.test(data.name)) {
    throw new RequestError(400, 'Please enter your name (up to 120 characters).');
  }
  if (typeof data.email !== 'string' || data.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email.trim()) || /[\x00-\x1f\x7f]/.test(data.email)) {
    throw new RequestError(400, 'Please enter a valid email address.');
  }
  if (data.comment !== undefined && (typeof data.comment !== 'string' || data.comment.length > 5000 || /\x00/.test(data.comment))) {
    throw new RequestError(400, 'Please keep your comment to 5,000 characters or fewer.');
  }
  return { name: data.name.trim(), email: data.email.trim().toLowerCase(), comment: (data.comment || '').trim() };
}

async function checkRateLimit(request, db) {
  const ip = request.headers.get('CF-Connecting-IP');
  // Cloudflare supplies this header in production; local development may omit it.
  if (!ip) return;
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / RATE_WINDOW_SECONDS);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${window}:${ip}`));
  const bucket = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const row = await db.prepare(`
    INSERT INTO contact_rate_limits (bucket, count, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(bucket) DO UPDATE SET count = MIN(count + 1, 6)
    RETURNING count
  `).bind(bucket, (window + 1) * RATE_WINDOW_SECONDS).first();
  if (row.count > 5) throw new RequestError(429, 'Too many requests. Please wait 10 minutes or email info@vibeloom.ai.');
}

async function submitContact(request, env, ctx) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });
  const origin = request.headers.get('Origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    return json({ error: 'Please submit using the contact form on this website.' }, 403);
  }
  try {
    const contact = await readPayload(request);
    await checkRateLimit(request, env.CONTACTS_DB);
    const now = new Date().toISOString();
    // Email is the sole identity key. The last accepted write replaces the details.
    const row = await env.CONTACTS_DB.prepare(`
      INSERT INTO contact_requests (id, name, email, comment, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        name = excluded.name, comment = excluded.comment, updated_at = excluded.updated_at,
        version = contact_requests.version + 1, notion_next_attempt = 0,
        notion_attempts = 0, notion_last_error = NULL
      RETURNING id
    `).bind(crypto.randomUUID(), contact.name, contact.email, contact.comment, now, now).first();
    if (!row) throw new Error('Contact not saved');
    ctx.waitUntil(syncContact(env, row.id).catch(() => {
      console.error(JSON.stringify({ event: 'contact_sync_deferred' }));
    }));
    // Do not disclose whether an email was already stored.
    return json({ ok: true });
  } catch (error) {
    if (error instanceof RequestError) {
      return json({ error: error.message }, error.status, error.status === 429 ? { 'Retry-After': '600' } : {});
    }
    console.error(JSON.stringify({ event: 'contact_save_failed' }));
    return json({ error: 'We could not save your request. Please try again or email info@vibeloom.ai.' }, 503);
  }
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    if (path === '/api/contact') return submitContact(request, env, ctx);
    if (path.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
    return env.ASSETS.fetch(request);
  },
  async scheduled(_event, env) {
    await env.CONTACTS_DB.prepare('DELETE FROM contact_rate_limits WHERE expires_at <= ?')
      .bind(Math.floor(Date.now() / 1000)).run();
    await syncPendingContacts(env);
  },
};
