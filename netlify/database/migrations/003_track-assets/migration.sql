-- One track, several encodings.
--
-- The owner uploads a WAV master; the desk derives FLAC and MP3 from it in the
-- browser before anything is sent. Streaming and offline use the FLAC because
-- it decodes bit-identically to the master at roughly half the bytes, so there
-- is no reason to ever ship the WAV itself down the wire. Downloads are MP3.
--
-- Replaces the single audio_key on `track`, which could only describe one file.

CREATE TABLE track_asset (
  track_id  TEXT NOT NULL REFERENCES track (id) ON DELETE CASCADE,

  -- 'wav' is the archival master. It is stored but never streamed: it exists so
  -- the owner can re-derive the other two if an encoder ever changes.
  format    TEXT NOT NULL CHECK (format IN ('flac', 'mp3', 'wav')),

  -- A storage key, never a URL. Audio must not sit at a guessable public path,
  -- so every byte is served through a route that checks the record's cookie.
  blob_key  TEXT NOT NULL,

  bytes     BIGINT NOT NULL,
  mime_type TEXT NOT NULL,

  -- Filled in from the master on upload, so the download rows can show a real
  -- size rather than the prototype's estimate-from-duration.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (track_id, format)
);

CREATE INDEX track_asset_track_idx ON track_asset (track_id);

-- Superseded by track_asset. All three are still NULL everywhere — no audio has
-- been uploaded yet — so dropping them loses nothing.
ALTER TABLE track DROP COLUMN audio_key;
ALTER TABLE track DROP COLUMN mime_type;
ALTER TABLE track DROP COLUMN bytes;

-- Likes. Real and persisted, but not social: nobody is ever shown who else
-- liked anything. One row per device per record makes the write idempotent,
-- so a double tap or a replayed request cannot inflate the number.
CREATE TABLE record_like (
  record_id  TEXT NOT NULL REFERENCES record (id) ON DELETE CASCADE,
  device_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (record_id, device_id)
);

CREATE INDEX record_like_record_idx ON record_like (record_id);
