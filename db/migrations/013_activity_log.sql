-- ACTIVITY LOG — what the panel did, for the Dashboard's "recent activity" feed.
--
-- Nothing like this existed before: a save writes content_drafts, a publish moves rows into
-- content_strings, and neither carries a record of the ACTION itself once the row it
-- concerns has moved on or been overwritten. This table is a plain append-only log of three
-- kinds of admin action, with the human-readable page/section names captured at write time
-- rather than looked up again later — a section renamed or removed afterwards should not
-- make its own history unreadable.
--
-- Operational, not content: there is nothing here to seed and nothing here that CONTENT_SOURCE
-- ever reads from — it is written only when CONTENT_SOURCE=database (see
-- CmsRepository.supportsActivityLog), the same way `inquiries` has no static-file counterpart.
CREATE TABLE IF NOT EXISTS activity_log (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  action        ENUM('saved', 'published', 'previewed') NOT NULL,
  page_label    VARCHAR(160) NOT NULL,
  -- NULL for an action that is not about one particular section — none exist today, but a
  -- page-level action is conceivable later and this leaves room for one without a schema change.
  section_label VARCHAR(160) NULL,
  occurred_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_activity_log_occurred (occurred_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
