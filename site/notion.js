const NOTION_VERSION = '2026-03-11';

function enabled(env) {
  return Boolean(env.NOTION_TOKEN && env.NOTION_DATA_SOURCE_ID);
}

function richText(value) {
  const chunks = [];
  // Stay below Notion's 2,000 UTF-16-unit limit without splitting surrogate pairs.
  let chunk = '';
  for (const char of value) {
    if (chunk.length + char.length > 2000) {
      chunks.push({ type: 'text', text: { content: chunk } });
      chunk = '';
    }
    chunk += char;
  }
  if (chunk) chunks.push({ type: 'text', text: { content: chunk } });
  return chunks;
}

async function notionRequest(env, fetcher, path, method, body) {
  const response = await fetcher(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) {
    const error = new Error(`notion_http_${response.status}`);
    error.status = response.status;
    error.retryAfter = Number(response.headers.get('Retry-After')) || 0;
    throw error;
  }
  return response.json();
}

async function updatePageIfPresent(env, fetcher, pageId, properties) {
  try {
    const page = await notionRequest(env, fetcher, `pages/${pageId}`, 'PATCH', { properties });
    if (!page?.id) throw new Error('notion_invalid_response');
    return page;
  } catch (error) {
    if (error.status === 404) return null;
    if (error.status !== 400) throw error;
    // A trashed page can reject updates with 400, just like an invalid payload.
    let existing;
    try {
      existing = await notionRequest(env, fetcher, `pages/${pageId}`, 'GET');
    } catch (lookupError) {
      if (lookupError.status === 404) return null;
      throw lookupError;
    }
    if (existing.in_trash === true) return null;
    throw error;
  }
}

export async function syncContact(env, id, fetcher = fetch) {
  if (!enabled(env)) return;
  const db = env.CONTACTS_DB;
  const now = Math.floor(Date.now() / 1000);
  const lease = crypto.randomUUID();
  // A lease serializes deliveries; a version keeps updates during delivery pending.
  const row = await db.prepare(`
    UPDATE contact_requests SET notion_lease_until = ?, notion_lease_token = ?,
      notion_attempts = notion_attempts + 1
    WHERE id = ? AND notion_synced_version < version
      AND notion_next_attempt <= ? AND notion_lease_until <= ?
    RETURNING *
  `).bind(now + 120, lease, id, now, now).first();
  if (!row) return;
  try {
    let pageId = row.notion_page_id;
    if (!pageId) {
      const matches = await notionRequest(env, fetcher, `data_sources/${env.NOTION_DATA_SOURCE_ID}/query`, 'POST', {
        filter: { property: 'Email', email: { equals: row.email } }, page_size: 2,
      });
      if (!Array.isArray(matches.results)) throw new Error('notion_invalid_response');
      if (matches.results.length > 1) throw new Error('notion_duplicate_email');
      pageId = matches.results[0]?.id;
    }
    const properties = {
      Name: { title: richText(row.name) },
      Email: { email: row.email },
      Comment: { rich_text: richText(row.comment) },
    };
    let page = pageId ? await updatePageIfPresent(env, fetcher, pageId, properties) : null;
    if (!page) {
      page = await notionRequest(env, fetcher, 'pages', 'POST', {
        parent: { type: 'data_source_id', data_source_id: env.NOTION_DATA_SOURCE_ID }, properties,
      });
    }
    if (!page?.id) throw new Error('notion_invalid_response');
    await db.prepare(`
      UPDATE contact_requests SET notion_page_id = ?, notion_synced_version = ?,
        notion_lease_until = 0, notion_lease_token = NULL, notion_next_attempt = 0,
        notion_last_error = NULL
      WHERE id = ? AND notion_lease_token = ?
    `).bind(page.id, row.version, row.id, lease).run();
  } catch (error) {
    const delay = Math.max(Math.min(3600, 60 * (2 ** Math.min(row.notion_attempts, 6))), Math.min(error.retryAfter || 0, 86400));
    const code = /^notion_(http_\d{3}|invalid_response|duplicate_email)$/.test(error.message) ? error.message : 'notion_delivery_failed';
    await db.prepare(`
      UPDATE contact_requests SET notion_lease_until = 0, notion_lease_token = NULL,
        notion_next_attempt = CASE WHEN version = ? THEN ? ELSE 0 END,
        notion_last_error = ?
      WHERE id = ? AND notion_lease_token = ?
    `).bind(row.version, Math.floor(Date.now() / 1000) + delay, code, row.id, lease).run();
    console.error(JSON.stringify({ event: 'notion_sync_failed', code }));
  }
}

export async function syncPendingContacts(env, fetcher = fetch) {
  if (!enabled(env)) return;
  const now = Math.floor(Date.now() / 1000);
  const pending = await env.CONTACTS_DB.prepare(`
    SELECT id FROM contact_requests WHERE notion_synced_version < version
      AND notion_next_attempt <= ? AND notion_lease_until <= ?
    ORDER BY notion_next_attempt, updated_at LIMIT 5
  `).bind(now, now).all();
  for (const row of pending.results) await syncContact(env, row.id, fetcher);
}
