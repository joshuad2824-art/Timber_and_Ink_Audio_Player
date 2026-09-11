-- The desk's own credential.
--
-- One row, because there is one owner. Kept in the database rather than an
-- environment variable so the owner can change their own password from the
-- desk without a redeploy, and so the hash is never something that has to be
-- pasted anywhere.
--
-- No password is seeded. Until the owner claims the desk the table is empty and
-- sign-in cannot succeed at all -- there is no default to forget to change.
CREATE TABLE admin_credential (
  id            INTEGER PRIMARY KEY DEFAULT 1,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_credential_singleton CHECK (id = 1)
);

-- Rate limiting needs separate buckets for the gate and the desk.
--
-- Without this they share one: a listener fumbling a phrase on the home wifi
-- would count against the owner's own sign-in attempts and could lock them out
-- of their desk from the next room.
ALTER TABLE unlock_attempt ADD COLUMN scope TEXT NOT NULL DEFAULT 'record';

DROP INDEX unlock_attempt_ip_time_idx;
CREATE INDEX unlock_attempt_scope_ip_time_idx
  ON unlock_attempt (scope, ip, attempted_at DESC);
