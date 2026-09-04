-- LOGIN RATE LIMITING.
--
-- In the database rather than in process memory for two reasons: a restart would
-- otherwise clear the lockout, which makes the limit a formality against anyone who can
-- provoke one; and a Node host that runs more than one worker would give each its own
-- counter and multiply the allowance by the number of workers.
--
-- The bucket is a coarse client key -- an IP, or the literal string when the host does
-- not supply one -- and nothing else about the request is kept. Rows older than the
-- window are pruned on write, so the table does not grow.

CREATE TABLE IF NOT EXISTS login_attempts (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_key  VARCHAR(191) NOT NULL COMMENT 'Hashed client address. Never the raw address.',
  succeeded   TINYINT(1)   NOT NULL DEFAULT 0,
  attempted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_login_attempts_window (client_key, attempted_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
