-- Cover art.
--
-- `cover_key` has been on `record` since the first migration, waiting for the
-- upload path to exist. Two columns join it now.
--
-- `cover_mime` because the bytes are served through a function, and a function
-- that has to guess at a content type from a file extension it invented is a
-- function that will one day serve a JPEG as a PNG. The type is decided once,
-- at upload, by the code that did the encoding.
--
-- `cover_updated_at` because the URL a listener fetches is stable
-- (/api/records/<slug>/cover) while the image behind it is not. The response
-- is cached hard -- a cover is looked at on every visit and it would be absurd
-- to re-send it each time -- so the page appends this timestamp as a version.
-- Replace the art and the URL changes; leave it alone and nothing re-downloads.
ALTER TABLE record ADD COLUMN cover_mime TEXT;
ALTER TABLE record ADD COLUMN cover_updated_at TIMESTAMPTZ;

-- Only the three together mean anything: a key with no type cannot be served
-- and a type with no key describes nothing. Enforced here rather than trusted
-- to the one route that writes them, because a half-written cover is the kind
-- of state that produces a broken image on a listener's screen months later.
ALTER TABLE record ADD CONSTRAINT record_cover_complete CHECK (
  (cover_key IS NULL AND cover_mime IS NULL AND cover_updated_at IS NULL)
  OR (cover_key IS NOT NULL AND cover_mime IS NOT NULL AND cover_updated_at IS NOT NULL)
);
