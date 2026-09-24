CREATE TABLE contact_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  notion_synced_version INTEGER NOT NULL DEFAULT 0,
  notion_page_id TEXT,
  notion_attempts INTEGER NOT NULL DEFAULT 0,
  notion_next_attempt INTEGER NOT NULL DEFAULT 0,
  notion_lease_until INTEGER NOT NULL DEFAULT 0,
  notion_lease_token TEXT,
  notion_last_error TEXT
);

CREATE INDEX contacts_pending_notion
  ON contact_requests(notion_next_attempt, notion_lease_until)
  WHERE notion_synced_version < version;

CREATE TABLE contact_rate_limits (
  bucket TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX contact_rate_expiry ON contact_rate_limits(expires_at);
