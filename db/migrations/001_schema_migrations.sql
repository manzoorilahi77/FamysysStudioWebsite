-- The migration ledger. Every other file in this directory is applied at most once and
-- recorded here, so a re-run is a no-op rather than a second CREATE TABLE.
--
-- `version` is the file's numeric prefix; `name` is the rest of the file name, kept so a
-- renamed file is visible as a rename rather than silently re-applying.
-- `checksum` is a SHA-256 of the file's bytes. A migration whose checksum no longer
-- matches what was applied is an EDITED migration, and the runner refuses rather than
-- pretending the database matches the directory.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version      INT UNSIGNED   NOT NULL,
  name         VARCHAR(160)   NOT NULL,
  checksum     CHAR(64)       NOT NULL,
  applied_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  duration_ms  INT UNSIGNED   NOT NULL DEFAULT 0,
  PRIMARY KEY (version)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
