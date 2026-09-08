-- UNPUBLISHED EDITS.
--
-- Save and publish are two different things, and this table is the difference. A save
-- writes here; the public site keeps reading `content_strings` and does not change. A
-- publish moves the value across and deletes the row. Discard deletes it without moving it.
--
-- WHY A SEPARATE TABLE RATHER THAN A DRAFT COLUMN. Two reasons, and the second is the one
-- that decided it. A column would make "is this section drafted?" a scan of every string on
-- it; a table makes it the presence of a row, which is what the sidebar asks for seven pages
-- at a time. And a column would put unpublished words in the row every page of the site
-- reads, one careless SELECT away from being served to the public. They cannot leak from
-- here by accident: the preview has to JOIN to see them, and only draft mode does.
--
-- `base_version` is the revision of the content_strings row when the edit was made. The
-- publish is conditional on it, so a row someone else published in between matches nothing
-- and the editor is told rather than silently reverting them.
--
-- There is deliberately no foreign key to content_strings: the strings table is keyed by a
-- surrogate id and addressed by (owner_kind, owner_key, field_key), and a draft saved
-- against a field that has not been seeded yet is a state worth being able to hold.

CREATE TABLE IF NOT EXISTS content_drafts (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_kind   ENUM('page_section','collection_record','media_asset') NOT NULL,
  owner_key    VARCHAR(160)  NOT NULL COMMENT 'page:section, or collection:record.',
  field_key    VARCHAR(160)  NOT NULL COMMENT 'Matches CmsValue.id within the record.',
  value        TEXT          NOT NULL COMMENT 'The saved, unpublished string.',
  base_version INT UNSIGNED  NOT NULL COMMENT 'content_strings.version when the edit was made.',
  created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_content_drafts (owner_kind, owner_key, field_key),
  KEY ix_content_drafts_owner (owner_kind, owner_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
