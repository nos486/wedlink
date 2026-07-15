-- WedLink D1 Database Schema v2
-- Run: wrangler d1 execute wedlink-db --remote --file=schema.sql
--
-- WARNING: If you already ran v1, drop your database and recreate it first,
-- or run the DROP TABLE statements below (uncomment them).
--
-- DROP TABLE IF EXISTS rsvps;
-- DROP TABLE IF EXISTS invitations;
-- DROP TABLE IF EXISTS sessions;
-- DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    UNIQUE NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invitations (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug           TEXT    UNIQUE NOT NULL,
  bride          TEXT    NOT NULL,
  groom          TEXT    NOT NULL,
  bride_fa       TEXT,
  groom_fa       TEXT,
  bride_family   TEXT,
  groom_family   TEXT,
  bride_family_fa TEXT,
  groom_family_fa TEXT,
  date           TEXT    NOT NULL,
  time           TEXT,
  venue          TEXT    NOT NULL,
  venue_fa       TEXT,
  message        TEXT,
  message_fa     TEXT,
  image_url      TEXT,
  theme          TEXT    DEFAULT 'modern-minimal',
  desktop_layout TEXT    DEFAULT '3d-card',
  mobile_layout  TEXT    DEFAULT '3d-card',
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_invitations_slug    ON invitations(slug);
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
