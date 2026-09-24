ALTER TABLE contact_requests ADD COLUMN submitted_at TEXT
  GENERATED ALWAYS AS (strftime('%Y-%m-%dT%H:%M:00.000Z', updated_at)) VIRTUAL;

CREATE INDEX contacts_submitted_at ON contact_requests(submitted_at);
