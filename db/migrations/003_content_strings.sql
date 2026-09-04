-- EVERY EDITABLE STRING ON THE SITE, ONE ROW EACH.
--
-- The unit is the string rather than the entity because that is the unit the panel edits
-- and the unit approval is tracked on: one case study carries an approved title from the
-- client's brief next to a drafted "why this piece", and a column-per-field table cannot
-- say that. It is also the address SaveCmsRecord already uses -- a target (page section
-- or collection record) and a field id within it -- so the write path needs no new
-- concept.
--
-- WHY THE SOURCE POINTER IS KEPT.
-- source_file/source_symbol/source_path is the ContentPointer the Phase 2 file writer
-- used. Nothing is looked up by it; it is how a row is traced back to the TypeScript it
-- was seeded from, which is what keeps the static modules a usable fallback and what
-- lets the seed recognise a row it has already written.
--
-- `version` is the optimistic-concurrency token. A write sends the version it loaded, the
-- UPDATE is conditional on it, and it increments. A row that changed underneath therefore
-- matches zero rows and is reported rather than silently overwritten.

CREATE TABLE IF NOT EXISTS content_strings (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_kind       ENUM('page_section','collection_record','media_asset') NOT NULL,
  owner_key        VARCHAR(160)  NOT NULL COMMENT 'page:section, collection:record, or a media file name.',
  field_key        VARCHAR(160)  NOT NULL COMMENT 'Matches CmsValue.id within the record.',
  label            VARCHAR(191)  NOT NULL COMMENT 'What the panel calls the field.',
  value            TEXT          NOT NULL,
  value_kind       ENUM('text','ctaLabel','url','mediaAlt') NOT NULL DEFAULT 'text'
                   COMMENT 'Which domain value object validates a write. Mirrors CmsValueKind.',
  list_key         VARCHAR(160)  NULL COMMENT 'Set when the string is one item of a named list.',
  sort_order       INT           NOT NULL DEFAULT 0,
  is_approved      TINYINT(1)    NOT NULL DEFAULT 0
                   COMMENT '1 = the client own copy, verbatim from a brief. 0 = drafted, pending approval.',
  is_editable      TINYINT(1)    NOT NULL DEFAULT 1,
  read_only_reason TEXT          NULL COMMENT 'Shown instead of an input when is_editable = 0.',
  source_file      VARCHAR(120)  NULL,
  source_symbol    VARCHAR(120)  NULL,
  source_path      JSON          NULL,
  version          INT UNSIGNED  NOT NULL DEFAULT 1,
  created_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_content_strings (owner_kind, owner_key, field_key),
  KEY ix_content_strings_owner (owner_kind, owner_key),
  KEY ix_content_strings_updated (updated_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
