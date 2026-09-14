-- `content_strings` CANNOT HOLD A MEDIA FILE'S PATH, AND ANY REPLACE THAT REACHES THE
-- DATABASE FAILS.
--
-- `CmsValueKind` has carried "mediaSrc" and "mediaPoster" since the media-replace feature
-- was built, and `MediaField`/`SaveCmsSection` have offered "Replace file" against every
-- media block since. But `value_kind` here was only ever `'text','ctaLabel','url',
-- 'mediaAlt'` — the two media-file kinds were never added to the enum, and `db:seed` only
-- ever seeded `media.alt`, never `media.src` or `media.posterValue`. So no row has ever
-- existed for a media block's file, on any page or record, and `DbCmsRepository.saveDrafts`
-- rejects every one of them with "That field is no longer on this section" — not because
-- anything moved, but because nothing was ever there. This was latent until something
-- actually tried to replace an image against the database, which surfaced it.
--
-- This migration only widens the column. The missing rows are inserted by `db:seed`
-- (insert-what-is-missing, per its own rule — see that script), which must be run after
-- this applies.

ALTER TABLE content_strings
  MODIFY COLUMN value_kind ENUM('text','ctaLabel','url','mediaAlt','mediaSrc','mediaPoster')
    NOT NULL DEFAULT 'text'
    COMMENT 'Which domain value object validates a write. Mirrors CmsValueKind.';
