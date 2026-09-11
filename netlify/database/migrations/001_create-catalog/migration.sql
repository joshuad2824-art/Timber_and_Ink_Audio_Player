-- Shadow Harbor — the catalog.
--
-- Ordering is explicit everywhere: `position` on records and tracks backs the
-- reorder controls at the desk. Nothing leans on created_at for order, because
-- the owner rearranges a record's tracks long after they were added.

CREATE TABLE record (
  id           TEXT PRIMARY KEY,

  -- Constrained at the boundary because the slug is not just an identifier:
  -- it becomes a URL segment and the Path of the per-record unlock cookie.
  -- Letting an arbitrary string in there would let the desk write a slug that
  -- widens its own cookie's scope.
  slug         TEXT UNIQUE NOT NULL
                 CONSTRAINT record_slug_shape CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  artist_name  TEXT NOT NULL,
  album_title  TEXT NOT NULL,
  year         INTEGER NOT NULL,
  intro        TEXT NOT NULL DEFAULT '',

  -- The access phrase, scrypt-hashed. NULL means nobody gets in: a record
  -- with no phrase is closed, not open. The gate treats the two identically
  -- so an empty phrase can never become a skeleton key.
  phrase_hash  TEXT,

  -- Two independent flags, and a record needs both to be publicly reachable.
  -- published=false is a draft: unreachable even with the correct phrase.
  -- listed=false is unlisted: reachable by direct link, hidden from the catalog.
  published    BOOLEAN NOT NULL DEFAULT FALSE,
  listed       BOOLEAN NOT NULL DEFAULT TRUE,

  cover_key    TEXT,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX record_position_idx ON record (position, id);

CREATE TABLE track (
  id         TEXT PRIMARY KEY,
  record_id  TEXT NOT NULL REFERENCES record (id) ON DELETE CASCADE,
  title      TEXT NOT NULL,

  -- Authored, not derived: the owner types 3:52 or 232 and both land here as
  -- seconds. Uploaded files probe their own duration and fill this in.
  seconds    INTEGER NOT NULL DEFAULT 0,

  hidden     BOOLEAN NOT NULL DEFAULT FALSE,
  position   INTEGER NOT NULL DEFAULT 0,

  -- Storage key, not a URL. Audio never sits at a guessable public path.
  audio_key  TEXT,
  mime_type  TEXT,
  bytes      BIGINT
);

CREATE INDEX track_record_position_idx ON track (record_id, position, id);

-- The site's own copy, editable from the desk. Exactly one row, forever.
CREATE TABLE site_text (
  id      INTEGER PRIMARY KEY DEFAULT 1,
  eyebrow TEXT NOT NULL,
  title   TEXT NOT NULL,
  intro   TEXT NOT NULL,
  footer  TEXT NOT NULL,
  CONSTRAINT site_text_singleton CHECK (id = 1)
);

-- Per-IP unlock attempts, for rate limiting. Rows are pruned on write rather
-- than by a scheduled job, so this table stays small without any cron.
CREATE TABLE unlock_attempt (
  id         BIGSERIAL PRIMARY KEY,
  ip         TEXT NOT NULL,
  slug       TEXT NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX unlock_attempt_ip_time_idx ON unlock_attempt (ip, attempted_at DESC);
