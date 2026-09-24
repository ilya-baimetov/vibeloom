# VibeLoom Site

This directory is the standalone public website project for `https://vibeloom.ai/`.

## Structure

| Path | Purpose |
| --- | --- |
| `wrangler.jsonc` | Worker, static assets, D1 binding, Notion destination, retry schedule |
| `public/` | Static site files served at `vibeloom.ai` |
| `worker.js` | Contact API, validation, email-based upsert, rate limiting |
| `notion.js` | Optional one-way Notion mirror with durable retry state in D1 |
| `migrations/` | D1 schema migrations |
| `tests/` | Backend tests using SQLite and simulated Notion responses |

## Cloudflare Setup

Use this directory as the project root in Cloudflare.

1. In Cloudflare Workers, create or import a Worker from the GitHub repo.
2. Use `main` as the production branch.
3. Set the repository root directory to `site`.
4. Do not set a separate build output directory.
5. Keep deployment config in `site/wrangler.jsonc`.
6. Attach `vibeloom.ai` and `www.vibeloom.ai` as custom domains after the zone is active in Cloudflare DNS.
7. Set the production deploy command to `npm run deploy`; it applies D1 migrations before deployment. Install dependencies with `npm ci` when not handled by the build platform.

The `vibeloom-contacts` D1 database is already provisioned and its initial migration
has been applied. The contact Worker is deployed in production. The current Git
deployment command is `npx wrangler deploy`; switch it to the recommended
`npm run deploy` before introducing further database migrations.

## Local Notes

- Static assets are served from `public/`.
- Deployed URL structure: `/` (overview), `/methodology`, `/implementation`, `/contact`, `/robots.txt`, `/sitemap.xml`.
- Shared styles live in `public/styles.css`; the contact form adds `contact.css` and `contact.js`.

## Local Preview

Run from this directory with Node.js 22.13+ (the tests use built-in `node:sqlite`):

```bash
npm ci
npm run db:local
npm run dev
# open http://localhost:8124/contact
```

The preview uses local D1, not production data. A static-only server can display
the page but cannot save the form. Test with `npm test`; validate packaging without
deploying using `npx wrangler deploy --dry-run`. Generate binding types with `npm run types`.

## Contact Semantics

```text
Contact form -> POST /api/contact -> D1 upsert by email -> success + cleared form
                                      |
                                      +-> Notion create/update (background)
                                      +-> retry pending changes every 5 minutes
```

- Name and email are required; comment is optional. Names are capped at 120 characters, email at 254, and comment at 5,000.
- Email is trimmed and lowercased. It is the only uniqueness key. Names never determine identity; plus-addresses and dotted addresses are not merged.
- The primary key is a generated UUID `id`. Email's unique constraint supplies its index; separate indexes cover `name`, `submitted_at` (the shared timestamp), and `updated_at` (the precise audit timestamp). `comment` is not indexed.
- A later accepted submission replaces name and comment, including clearing a previous comment when the new one is blank. The original creation timestamp is preserved; the update timestamp and version advance. There is no submission history.
- D1 preserves full-precision UTC ISO 8601 `created_at` and `updated_at` audit timestamps. Its generated `submitted_at` column rounds `updated_at` down to the minute to match the precision observed in Notion's `Date` field. The Worker copies `submitted_at` directly into `Date`, including on retries and replacement rows. This is submission time, not delivery time. Notion may display it in your local time zone.
- Public responses never reveal whether an address already exists. An entered email is **not verified**: another person knowing an address could overwrite its submitted details. Do not use these records for authentication, identity verification, or marketing consent.
- Success is shown only after D1 confirms the save. Failure preserves the form; the submit button is disabled during a request. Opening/closing the disclosure does not discard a draft.
- The API enforces JSON, same-origin browser requests, a 32 KiB body limit, a honeypot, and five submissions per IP per 10-minute window. Only temporary windowed IP hashes are stored and expired buckets are cleaned by the scheduled job. These are basic abuse controls, not strong bot prevention; add Cloudflare Turnstile if needed.
- D1 and Notion contain personal contact data. Restrict administrator access and remove records from both stores when fulfilling a deletion request. No contact contents or tokens are logged by application code.

## Notion Mirror

Destination: [VibeLoom / Contacts](https://www.notion.so/3e5b73b9298a8011b1a5e651d3905b67).
The configured **data source ID** is `3e5b73b9-298a-80c1-92cc-000b10119aa1`.
Its properties are `Name` (title), `Email` (email), `Comment` (rich text), and
`Date` (date with time, mirrored from D1 `submitted_at`).

1. Create an internal Notion integration with **read, insert, and update content** capabilities and grant it access to this database. The chat's Notion connector is not a deployable runtime credential.
2. Add its token directly to Cloudflare, not to chat or source control:

   ```bash
   npx wrangler secret put NOTION_TOKEN
   ```

3. Deploy with `npm run deploy`, or use the configured production Git deployment workflow.
4. Verify a controlled submission in both D1 and Notion after configuration changes.

Live production verification on September 24, 2026 confirmed creation in both
stores and an update to the same Notion page when the email was resubmitted with
different capitalization, a changed name, and an empty comment. Automated tests
also cover delivery and failure handling with simulated Notion API responses.

With no token, the contact form still saves to D1. Once configured, the next scheduled
run picks up pending contacts, including earlier submissions. One batch processes
up to five contacts. Failures back off and remain pending; submissions do not depend
on Notion availability.

The mirror updates the remembered Notion page. If that page returns 404 or is
confirmed to be in Trash after a rejected update, it creates a fresh row directly
and remembers the new page ID. It does not search for another matching row or
restore the old one. Other errors retain the existing link and retry later.
When no page ID is stored, it first searches by email. Leases prevent overlapping
deliveries; versions ensure that edits received during a sync remain pending. This
is eventual, one-way sync, not a transaction across D1 and Notion or an exactly-once
guarantee. A replacement whose create response is lost can be duplicated on retry;
those ambiguous failures still require manual reconciliation. Notion also uses 404
for pages hidden from the integration, so keep its access consistent across Contacts.
Multiple email matches are flagged, not arbitrarily overwritten. Notion edits do not
flow back to D1 and may be replaced by the next website submission. Do not change the
Notion data source without also handling stored page IDs. Direct SQL writes do not
automatically enqueue changes: updates must increment `version` and reset `notion_next_attempt`.

### Operations

Inspect pending delivery without printing contact details:

```bash
npx wrangler d1 execute CONTACTS_DB --remote --command "SELECT id, version, notion_synced_version, notion_attempts, notion_last_error FROM contact_requests WHERE notion_synced_version < version;"
```

Missing or trashed destinations recover automatically on the next pending delivery
or new submission. Already-synced contacts are not continuously checked for deletion.
After manually reconciling duplicate email entries or moving a destination, clear
`notion_page_id`, reset `notion_next_attempt`, and increment `version` for that
affected contact to let the worker find/create its destination again, even if it
was previously marked as synced. Keep existing contacts intact.

References: [D1 pricing and free-plan limits](https://developers.cloudflare.com/d1/platform/pricing/),
[Worker/static asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/),
[Notion page creation](https://developers.notion.com/reference/post-page),
[Notion API status codes](https://developers.notion.com/reference/status-codes),
[Notion data source filters](https://developers.notion.com/reference/filter-data-source-entries).
