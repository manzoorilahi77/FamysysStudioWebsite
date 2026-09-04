-- THE MEDIA LIBRARY.
--
-- The FILES stay on disk under public/media -- nothing here holds bytes, and uploading is
-- still out of scope. What the table adds is the part of a media asset that is content
-- rather than a file: its default alt text, and the dimensions the panel shows.
--
-- Alt text deliberately lives in TWO places, and they are not duplicates. `default_alt`
-- here describes the file. The alt a particular record uses lives in content_strings,
-- because the same still carries a different description on the homepage tile than it
-- does on /selected-work, and both are copy an editor writes.

CREATE TABLE IF NOT EXISTS media_assets (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  file_name   VARCHAR(160)  NOT NULL COMMENT 'Unique within public/media. Also the panel row id.',
  path        VARCHAR(191)  NOT NULL COMMENT 'The site-root path content refers to it by.',
  extension   VARCHAR(12)   NOT NULL,
  default_alt TEXT          NULL,
  width       INT UNSIGNED  NULL,
  height      INT UNSIGNED  NULL,
  byte_size   BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_media_assets_file (file_name),
  UNIQUE KEY uq_media_assets_path (path)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
