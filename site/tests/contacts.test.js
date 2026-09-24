import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import worker from '../worker.js';
import { syncContact, syncPendingContacts } from '../notion.js';

function setup(t) {
  const sqlite = new DatabaseSync(':memory:');
  const migrations = new URL('../migrations/', import.meta.url);
  for (const file of readdirSync(migrations).filter((name) => name.endsWith('.sql')).sort()) {
    sqlite.exec(readFileSync(new URL(file, migrations), 'utf8'));
  }
  t.after(() => sqlite.close());
  const db = {
    prepare(sql) {
      const stmt = sqlite.prepare(sql);
      return {
        params: [],
        bind(...params) { this.params = params; return this; },
        async first() { return stmt.get(...this.params) || null; },
        async all() { return { results: stmt.all(...this.params) }; },
        async run() { return stmt.run(...this.params); },
      };
    },
  };
  const env = { CONTACTS_DB: db, ASSETS: { fetch: async () => new Response('static') } };
  const contact = { name: 'Ada Example', email: 'ada@example.com', comment: 'Hello' };
  const all = () => sqlite.prepare('SELECT * FROM contact_requests').all();
  async function submit(data = contact, headers = {}) {
    const background = [];
    const response = await worker.fetch(new Request('https://vibeloom.ai/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://vibeloom.ai', ...headers },
      body: typeof data === 'string' ? data : JSON.stringify(data),
    }), env, { waitUntil: (promise) => background.push(promise) });
    await Promise.all(background);
    return response;
  }
  const notionEnv = { ...env, NOTION_TOKEN: 'test-token', NOTION_DATA_SOURCE_ID: 'test-source' };
  return { sqlite, db, env, notionEnv, contact, all, submit };
}

test('saves a normalized contact, supports optional comment, and exposes no contact data', async (t) => {
  const s = setup(t);
  const response = await s.submit({ name: ' Ada ', email: ' ADA@Example.com ' });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(s.all()[0].name, 'Ada');
  assert.equal(s.all()[0].email, 'ada@example.com');
  assert.equal(s.all()[0].comment, '');
  assert.match(s.all()[0].created_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.equal(s.all()[0].created_at, s.all()[0].updated_at);
});

test('contact identity, name, email, and submission time are indexed, but comment is not', (t) => {
  const s = setup(t);
  const indexes = s.sqlite.prepare("PRAGMA index_list('contact_requests')").all().map((index) => ({
    ...index,
    columns: s.sqlite.prepare('SELECT name FROM pragma_index_info(?) ORDER BY seqno')
      .all(index.name).map((column) => column.name),
  }));
  assert.ok(indexes.some((index) => index.origin === 'pk' && index.columns[0] === 'id'));
  assert.ok(indexes.some((index) => index.unique === 1 && index.columns[0] === 'email'));
  for (const column of ['name', 'email', 'updated_at']) {
    assert.ok(indexes.some((index) => index.columns[0] === column), `${column} needs a leading index`);
  }
  assert.ok(indexes.every((index) => !index.columns.includes('comment')));
  const byName = s.sqlite.prepare('EXPLAIN QUERY PLAN SELECT id FROM contact_requests WHERE name = ?').all('Ada');
  const byTime = s.sqlite.prepare('EXPLAIN QUERY PLAN SELECT id FROM contact_requests WHERE updated_at >= ? ORDER BY updated_at')
    .all('2026-01-01T00:00:00.000Z');
  assert.ok(byName.some((step) => step.detail.includes('contacts_name')));
  assert.ok(byTime.some((step) => step.detail.includes('contacts_updated_at')));
});

test('email alone identifies contact: replaces name/comment, clears blank comment, preserves identity', async (t) => {
  const s = setup(t);
  await s.submit();
  const original = s.all()[0];
  await s.submit({ name: 'Changed Name', email: 'ADA@EXAMPLE.COM', comment: '' });
  const [latest] = s.all();
  assert.equal(s.all().length, 1);
  assert.equal(latest.id, original.id);
  assert.equal(latest.created_at, original.created_at);
  assert.equal(latest.name, 'Changed Name');
  assert.equal(latest.comment, '');
  assert.equal(latest.version, 2);
  await s.submit({ ...s.contact, email: 'other@example.com' });
  assert.equal(s.all().length, 2);
});

test('concurrent saves to one email never create duplicate contacts', async (t) => {
  const s = setup(t);
  await Promise.all(Array.from({ length: 8 }, (_, i) => s.submit({ ...s.contact, name: `Name ${i}` })));
  assert.equal(s.all().length, 1);
  assert.equal(s.all()[0].version, 8);
});

test('rejects malformed/invalid data, honeypot, wrong content type, and oversized bodies', async (t) => {
  const s = setup(t);
  for (const data of [null, [], '{broken', { ...s.contact, name: ' ' }, { ...s.contact, name: 'a'.repeat(121) },
    { ...s.contact, email: 'no-email' }, { ...s.contact, email: 'bad\u0000@example.com' },
    { ...s.contact, comment: 42 }, { ...s.contact, comment: 'x'.repeat(5001) }, { ...s.contact, website: 'spam' }]) {
    assert.equal((await s.submit(data)).status, 400);
  }
  assert.equal((await s.submit(s.contact, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await s.submit('x'.repeat(32769))).status, 413);
  assert.equal((await s.submit(s.contact, { 'Content-Length': '50000' })).status, 413);
  assert.equal(s.all().length, 0);
});

test('cross-site requests are rejected; methods and routes are bounded', async (t) => {
  const s = setup(t);
  assert.equal((await s.submit(s.contact, { Origin: 'https://elsewhere.example' })).status, 403);
  assert.equal((await s.submit(s.contact, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  const get = await worker.fetch(new Request('https://vibeloom.ai/api/contact'), s.env, {});
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('Allow'), 'POST');
  assert.equal((await worker.fetch(new Request('https://vibeloom.ai/api/unknown'), s.env, {})).status, 404);
  assert.equal(await (await worker.fetch(new Request('https://vibeloom.ai/contact'), s.env, {})).text(), 'static');
});

test('storage failure never reports success', async (t) => {
  const s = setup(t);
  s.env.CONTACTS_DB = { prepare() { throw new Error('private storage details'); } };
  const response = await s.submit();
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /private storage/);
});

test('rate limits by temporary IP hash, then scheduled cleanup removes expired buckets', async (t) => {
  const s = setup(t);
  const headers = { 'CF-Connecting-IP': '192.0.2.1' };
  for (let i = 0; i < 5; i++) assert.equal((await s.submit(s.contact, headers)).status, 200);
  const response = await s.submit(s.contact, headers);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '600');
  const bucket = s.sqlite.prepare('SELECT bucket FROM contact_rate_limits').get().bucket;
  assert.match(bucket, /^[a-f0-9]{64}$/);
  s.sqlite.exec('UPDATE contact_rate_limits SET expires_at = 0');
  await worker.scheduled({}, s.env);
  assert.equal(s.sqlite.prepare('SELECT COUNT(*) AS count FROM contact_rate_limits').get().count, 0);
});

test('SQL-looking and HTML-looking input is stored as inert text', async (t) => {
  const s = setup(t);
  const comment = "'); DROP TABLE contact_requests; -- <script>alert(1)</script>";
  assert.equal((await s.submit({ ...s.contact, comment })).status, 200);
  assert.equal(s.all()[0].comment, comment);
});

test('Notion is optional: pending contacts survive until credentials are configured', async (t) => {
  const s = setup(t);
  await s.submit();
  await syncPendingContacts(s.env, () => { throw new Error('must not call'); });
  assert.equal(s.all()[0].notion_synced_version, 0);
  assert.equal(s.all()[0].notion_attempts, 0);
});

test('creates Notion entry with matching schema, then updates same page for the same email', async (t) => {
  const s = setup(t);
  await s.submit({ ...s.contact, comment: 'x'.repeat(1999) + '\u{1f600}' + 'y'.repeat(2500) });
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, ...options, body: JSON.parse(options.body) });
    return Response.json(url.endsWith('/query') ? { results: [] } : { id: 'page-1' });
  };
  await syncPendingContacts(s.notionEnv, fetcher);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].body.filter, { property: 'Email', email: { equals: s.contact.email } });
  const chunks = calls[1].body.properties.Comment.rich_text;
  assert.ok(chunks.every((x) => x.text.content.length <= 2000));
  assert.equal(chunks.map((x) => x.text.content).join(''), s.all()[0].comment);
  assert.deepEqual(calls[1].body.properties.Date, { date: { start: s.all()[0].updated_at } });
  assert.equal(s.all()[0].notion_synced_version, 1);
  await s.submit({ ...s.contact, name: 'New Name', comment: '' });
  await syncPendingContacts(s.notionEnv, fetcher);
  assert.equal(calls.length, 3);
  assert.equal(calls[2].method, 'PATCH');
  assert.match(calls[2].url, /pages\/page-1$/);
  assert.deepEqual(calls[2].body.properties.Comment.rich_text, []);
  assert.deepEqual(calls[2].body.properties.Date, { date: { start: s.all()[0].updated_at } });
  assert.equal(s.all()[0].notion_synced_version, 2);
});

test('recovers existing Notion page by email instead of appending another', async (t) => {
  const s = setup(t);
  await s.submit();
  const methods = [];
  await syncPendingContacts(s.notionEnv, async (url, options) => {
    methods.push(options.method);
    return Response.json(url.endsWith('/query') ? { results: [{ id: 'existing' }] } : { id: 'existing' });
  });
  assert.deepEqual(methods, ['POST', 'PATCH']);
  assert.equal(s.all()[0].notion_page_id, 'existing');
});

test('Notion failure schedules retry without losing D1 data or exposing API response', async (t) => {
  const s = setup(t);
  await s.submit();
  await syncPendingContacts(s.notionEnv, async () => new Response('sensitive diagnostic', { status: 429, headers: { 'Retry-After': '900' } }));
  const row = s.all()[0];
  assert.equal(row.notion_synced_version, 0);
  assert.equal(row.notion_last_error, 'notion_http_429');
  assert.ok(row.notion_next_attempt >= Math.floor(Date.now() / 1000) + 899);
  assert.equal(row.notion_lease_until, 0);
  await syncPendingContacts(s.notionEnv, () => { throw new Error('too early'); });
  assert.equal(s.all()[0].notion_attempts, 1);
  s.sqlite.exec('UPDATE contact_requests SET notion_next_attempt = 0');
  await syncPendingContacts(s.notionEnv, async (url) => Response.json(url.endsWith('/query') ? { results: [] } : { id: 'retried' }));
  assert.equal(s.all()[0].notion_synced_version, 1);
});

test('leases prevent overlapping delivery; updates arriving mid-sync remain pending', async (t) => {
  const s = setup(t);
  await s.submit();
  const id = s.all()[0].id;
  let calls = 0;
  await syncContact(s.notionEnv, id, async (url) => {
    calls++;
    if (url.endsWith('/query')) {
      await syncContact(s.notionEnv, id, () => { throw new Error('lease ignored'); });
      await s.submit({ ...s.contact, name: 'Newer' });
      return Response.json({ results: [] });
    }
    return Response.json({ id: 'page-race' });
  });
  assert.equal(calls, 2);
  assert.equal(s.all()[0].version, 2);
  assert.equal(s.all()[0].notion_synced_version, 1);
  await syncPendingContacts(s.notionEnv, async (_url, options) => {
    assert.equal(JSON.parse(options.body).properties.Name.title[0].text.content, 'Newer');
    return Response.json({ id: 'page-race' });
  });
  assert.equal(s.all()[0].notion_synced_version, 2);
});

test('multiple existing Notion matches require operator repair, not arbitrary overwrite', async (t) => {
  const s = setup(t);
  await s.submit();
  await syncPendingContacts(s.notionEnv, async () => Response.json({ results: [{ id: 'a' }, { id: 'b' }] }));
  assert.equal(s.all()[0].notion_last_error, 'notion_duplicate_email');
  assert.equal(s.all()[0].notion_page_id, null);
});

test('missing stored Notion page is replaced directly and subsequent submissions update the replacement', async (t) => {
  const s = setup(t);
  await s.submit();
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'missing', notion_synced_version = 1");
  await s.submit({ ...s.contact, name: 'Latest Name', comment: '' });
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    if (url.endsWith('/pages/missing')) return new Response(null, { status: 404 });
    assert.ok(!url.endsWith('/query'), 'must not search for another matching row');
    return Response.json({ id: 'replacement' });
  };
  await syncPendingContacts(s.notionEnv, fetcher);
  assert.deepEqual(calls.map((call) => call.method), ['PATCH', 'POST']);
  assert.equal(calls[1].url, 'https://api.notion.com/v1/pages');
  assert.deepEqual(calls[1].body, {
    parent: { type: 'data_source_id', data_source_id: 'test-source' },
    properties: {
      Name: { title: [{ type: 'text', text: { content: 'Latest Name' } }] },
      Email: { email: s.contact.email },
      Comment: { rich_text: [] },
      Date: { date: { start: s.all()[0].updated_at } },
    },
  });
  assert.equal(s.all()[0].notion_page_id, 'replacement');
  assert.equal(s.all()[0].notion_synced_version, 2);
  assert.equal(s.all()[0].notion_last_error, null);
  await s.submit({ ...s.contact, comment: 'Next update' });
  await syncPendingContacts(s.notionEnv, fetcher);
  assert.deepEqual(calls.map((call) => call.method), ['PATCH', 'POST', 'PATCH']);
  assert.ok(calls[2].url.endsWith('/pages/replacement'));
  assert.equal(s.all()[0].notion_synced_version, 3);
});

test('400 on a trashed page creates a replacement without restoring or searching', async (t) => {
  const s = setup(t);
  await s.submit();
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'trashed'");
  const methods = [];
  await syncPendingContacts(s.notionEnv, async (url, options) => {
    methods.push(options.method);
    assert.ok(!url.endsWith('/query'));
    if (options.method === 'PATCH') {
      assert.deepEqual(Object.keys(JSON.parse(options.body)), ['properties']);
      return new Response(null, { status: 400 });
    }
    if (options.method === 'GET') {
      assert.equal(options.body, undefined);
      return Response.json({ id: 'trashed', in_trash: true });
    }
    assert.equal(url, 'https://api.notion.com/v1/pages');
    return Response.json({ id: 'replacement' });
  });
  assert.deepEqual(methods, ['PATCH', 'GET', 'POST']);
  assert.equal(s.all()[0].notion_page_id, 'replacement');
  assert.equal(s.all()[0].notion_synced_version, 1);
});

test('400 is not treated as deletion when the page still exists', async (t) => {
  const s = setup(t);
  await s.submit();
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'existing'");
  const methods = [];
  await syncPendingContacts(s.notionEnv, async (_url, options) => {
    methods.push(options.method);
    assert.notEqual(options.method, 'POST');
    return options.method === 'PATCH'
      ? new Response('private validation details', { status: 400 })
      : Response.json({ id: 'existing', in_trash: false });
  });
  assert.deepEqual(methods, ['PATCH', 'GET']);
  assert.equal(s.all()[0].notion_page_id, 'existing');
  assert.equal(s.all()[0].notion_synced_version, 0);
  assert.equal(s.all()[0].notion_last_error, 'notion_http_400');
});

test('page disappearing during the 400 diagnostic lookup is replaced', async (t) => {
  const s = setup(t);
  await s.submit();
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'missing'");
  const methods = [];
  await syncPendingContacts(s.notionEnv, async (_url, options) => {
    methods.push(options.method);
    if (options.method === 'PATCH') return new Response(null, { status: 400 });
    if (options.method === 'GET') return new Response(null, { status: 404 });
    return Response.json({ id: 'replacement' });
  });
  assert.deepEqual(methods, ['PATCH', 'GET', 'POST']);
  assert.equal(s.all()[0].notion_page_id, 'replacement');
});

test('auth, rate limit, server, and network failures never create replacements', async (t) => {
  for (const status of [401, 403, 429, 503, 'network']) {
    await t.test(String(status), async (t) => {
      const s = setup(t);
      await s.submit();
      s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'existing'");
      let calls = 0;
      await syncPendingContacts(s.notionEnv, async (_url, options) => {
        calls++;
        assert.equal(options.method, 'PATCH');
        if (status === 'network') throw new TypeError('private network details');
        return new Response(null, { status });
      });
      assert.equal(calls, 1);
      assert.equal(s.all()[0].notion_page_id, 'existing');
      assert.equal(s.all()[0].notion_synced_version, 0);
      assert.equal(s.all()[0].notion_lease_until, 0);
      assert.equal(s.all()[0].notion_last_error, status === 'network' ? 'notion_delivery_failed' : `notion_http_${status}`);
    });
  }
});

test('failure to inspect a rejected page is not evidence of deletion', async (t) => {
  const s = setup(t);
  await s.submit();
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'existing'");
  const methods = [];
  await syncPendingContacts(s.notionEnv, async (_url, options) => {
    methods.push(options.method);
    assert.notEqual(options.method, 'POST');
    return new Response(null, { status: options.method === 'PATCH' ? 400 : 403 });
  });
  assert.deepEqual(methods, ['PATCH', 'GET']);
  assert.equal(s.all()[0].notion_page_id, 'existing');
  assert.equal(s.all()[0].notion_synced_version, 0);
  assert.equal(s.all()[0].notion_last_error, 'notion_http_403');
});

test('an invalid successful update response does not cause a duplicate creation', async (t) => {
  const s = setup(t);
  await s.submit();
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'existing'");
  let calls = 0;
  await syncPendingContacts(s.notionEnv, async (_url, options) => {
    calls++;
    assert.equal(options.method, 'PATCH');
    return Response.json(null);
  });
  assert.equal(calls, 1);
  assert.equal(s.all()[0].notion_page_id, 'existing');
  assert.equal(s.all()[0].notion_synced_version, 0);
  assert.equal(s.all()[0].notion_last_error, 'notion_invalid_response');
});

test('failed replacement remains pending and retains the old link until creation succeeds', async (t) => {
  const s = setup(t);
  await s.submit();
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'missing'");
  await syncPendingContacts(s.notionEnv, async (_url, options) =>
    new Response(null, { status: options.method === 'PATCH' ? 404 : 503 }));
  assert.equal(s.all()[0].notion_page_id, 'missing');
  assert.equal(s.all()[0].notion_synced_version, 0);
  assert.equal(s.all()[0].notion_last_error, 'notion_http_503');
  assert.equal(s.all()[0].name, s.contact.name);
  s.sqlite.exec('UPDATE contact_requests SET notion_next_attempt = 0');
  await syncPendingContacts(s.notionEnv, async (_url, options) => options.method === 'PATCH'
    ? new Response(null, { status: 404 }) : Response.json({ id: 'replacement' }));
  assert.equal(s.all()[0].notion_page_id, 'replacement');
  assert.equal(s.all()[0].notion_synced_version, 1);
});

test('replacement keeps the lease and preserves submissions arriving during creation', async (t) => {
  const s = setup(t);
  await s.submit();
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'missing'");
  const id = s.all()[0].id;
  await syncContact(s.notionEnv, id, async (_url, options) => {
    if (options.method === 'PATCH') return new Response(null, { status: 404 });
    await s.submit({ ...s.contact, name: 'Newer' });
    await syncContact(s.notionEnv, id, () => { throw new Error('lease ignored'); });
    return Response.json({ id: 'replacement' });
  });
  assert.equal(s.all()[0].version, 2);
  assert.equal(s.all()[0].notion_synced_version, 1);
  assert.equal(s.all()[0].notion_page_id, 'replacement');
  await syncPendingContacts(s.notionEnv, async (url, options) => {
    assert.equal(options.method, 'PATCH');
    assert.ok(url.endsWith('/pages/replacement'));
    assert.equal(JSON.parse(options.body).properties.Name.title[0].text.content, 'Newer');
    return Response.json({ id: 'replacement' });
  });
  assert.equal(s.all()[0].notion_synced_version, 2);
});

test('a row found on initial email lookup but deleted before update is replaced without another search', async (t) => {
  const s = setup(t);
  await s.submit();
  let queries = 0;
  await syncPendingContacts(s.notionEnv, async (url, options) => {
    if (url.endsWith('/query')) {
      queries++;
      return Response.json({ results: [{ id: 'vanished' }] });
    }
    if (options.method === 'PATCH') return new Response(null, { status: 404 });
    return Response.json({ id: 'replacement' });
  });
  assert.equal(queries, 1);
  assert.equal(s.all()[0].notion_page_id, 'replacement');
});

test('replacement and retries reuse the exact saved timestamp, not the delivery time', async (t) => {
  const s = setup(t);
  await s.submit();
  const created = '2026-01-01T12:00:00.123Z';
  const updated = '2026-02-01T12:34:56.789Z';
  s.sqlite.prepare("UPDATE contact_requests SET created_at = ?, updated_at = ?, notion_page_id = 'missing'")
    .run(created, updated);
  let failCreation = true;
  const sentTimestamps = [];
  const fetcher = async (_url, options) => {
    sentTimestamps.push(JSON.parse(options.body).properties.Date.date.start);
    if (options.method === 'PATCH') return new Response(null, { status: 404 });
    return failCreation ? new Response(null, { status: 503 }) : Response.json({ id: 'replacement' });
  };
  await syncPendingContacts(s.notionEnv, fetcher);
  failCreation = false;
  s.sqlite.exec('UPDATE contact_requests SET notion_next_attempt = 0');
  await syncPendingContacts(s.notionEnv, fetcher);
  assert.deepEqual(sentTimestamps, [updated, updated, updated, updated]);
  assert.equal(s.all()[0].created_at, created);
  assert.equal(s.all()[0].updated_at, updated);
  assert.equal(s.all()[0].notion_synced_version, 1);
});

test('timestamp backfill resyncs an existing row without altering its submission times', async (t) => {
  const s = setup(t);
  await s.submit();
  const original = s.all()[0];
  s.sqlite.exec("UPDATE contact_requests SET notion_page_id = 'existing', notion_synced_version = version");
  s.sqlite.exec('UPDATE contact_requests SET version = version + 1, notion_next_attempt = 0');
  await syncPendingContacts(s.notionEnv, async (url, options) => {
    assert.ok(url.endsWith('/pages/existing'));
    assert.equal(options.method, 'PATCH');
    assert.equal(JSON.parse(options.body).properties.Date.date.start, original.updated_at);
    return Response.json({ id: 'existing' });
  });
  assert.equal(s.all()[0].created_at, original.created_at);
  assert.equal(s.all()[0].updated_at, original.updated_at);
  assert.equal(s.all()[0].notion_synced_version, 2);
  assert.equal(s.all()[0].notion_page_id, 'existing');
});
