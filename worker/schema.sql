-- WedLink D1 Database Schema
-- Run: wrangler d1 execute wedlink-db --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS invitations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT    UNIQUE NOT NULL,
  bride      TEXT    NOT NULL,
  groom      TEXT    NOT NULL,
  date       TEXT    NOT NULL,
  venue      TEXT    NOT NULL,
  message    TEXT,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rsvps (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  invitation_id INTEGER NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_name    TEXT    NOT NULL,
  attending     INTEGER NOT NULL CHECK (attending IN (0, 1)),
  message       TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invitations_slug ON invitations(slug);
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON rsvps(invitation_id);
