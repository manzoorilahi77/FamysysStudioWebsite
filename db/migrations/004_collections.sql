-- THE FIVE OPEN COLLECTIONS.
--
-- Unlike pages, these have a cardinality an editor can change, which is the whole reason
-- they are tables of their own rather than more content_strings rows: a create is an
-- INSERT here and a delete is a DELETE, and the strings hanging off the record follow by
-- foreign key.
--
-- Each record's copy still lives in content_strings, keyed
-- ('collection_record', '<collection>:<slug>', '<field>'). What lives HERE is the
-- record's identity and the structure the site needs to render it -- the slug, the
-- ordering, the media file it points at, the capabilities it references. Splitting it
-- that way keeps one approval flag per string, and keeps a create from having to invent
-- values for twenty columns.
--
-- SLUGS ARE THE KEY, AND THEY ARE STABLE. Every anchor, filter chip and cross-page link
-- resolves by slug. Renaming one is a redirect, not an edit, which is why the panel shows
-- it read-only.

CREATE TABLE IF NOT EXISTS case_studies (
  id                 INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  slug               VARCHAR(96)   NOT NULL,
  reference          VARCHAR(8)    NOT NULL COMMENT 'Two-digit label chip from the numbered list in the brief.',
  home_media_path    VARCHAR(191)  NOT NULL COMMENT 'The homepage summary tile cover.',
  home_media_kind    ENUM('image','video') NOT NULL DEFAULT 'image',
  home_media_ratio   VARCHAR(12)   NOT NULL DEFAULT '4:3',
  detail_media_path  VARCHAR(191)  NOT NULL COMMENT '/selected-work carries its own page-scale cover.',
  detail_media_kind  ENUM('image','video') NOT NULL DEFAULT 'image',
  detail_media_ratio VARCHAR(12)   NOT NULL DEFAULT '4:3',
  sort_order         INT           NOT NULL DEFAULT 0,
  created_at         DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at         DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_case_studies_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS capabilities (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(96)   NOT NULL COMMENT 'Anchor target on /creative-services; the nav panel links to it.',
  media_path  VARCHAR(191)  NOT NULL,
  media_kind  ENUM('image','video') NOT NULL DEFAULT 'image',
  media_ratio VARCHAR(12)   NOT NULL DEFAULT '4:3',
  sort_order  INT           NOT NULL DEFAULT 0,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_capabilities_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Which capabilities a piece of work exercises. The chip label is the capability's own
-- approved title, read through this join -- never a second copy that could drift from it.
CREATE TABLE IF NOT EXISTS case_study_capabilities (
  case_study_id INT UNSIGNED NOT NULL,
  capability_id INT UNSIGNED NOT NULL,
  sort_order    INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (case_study_id, capability_id),
  CONSTRAINT fk_csc_case_study FOREIGN KEY (case_study_id) REFERENCES case_studies (id) ON DELETE CASCADE,
  CONSTRAINT fk_csc_capability FOREIGN KEY (capability_id) REFERENCES capabilities (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS process_steps (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(96)   NOT NULL COMMENT 'Anchor target for the jump links in the overview.',
  media_path  VARCHAR(191)  NOT NULL,
  media_kind  ENUM('image','video') NOT NULL DEFAULT 'image',
  media_ratio VARCHAR(12)   NOT NULL DEFAULT '4:3',
  sort_order  INT           NOT NULL DEFAULT 0,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_process_steps_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- `is_custom` marks the Custom Creative Partnership, which the brief gives an invitation
-- instead of an idealFor/typicalWork pair. It is a tier in every other respect, so it is
-- a flag rather than a table of its own.
CREATE TABLE IF NOT EXISTS engagement_tiers (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(96)   NOT NULL,
  is_custom   TINYINT(1)    NOT NULL DEFAULT 0,
  media_path  VARCHAR(191)  NOT NULL,
  media_kind  ENUM('image','video') NOT NULL DEFAULT 'image',
  media_ratio VARCHAR(12)   NOT NULL DEFAULT '4:3',
  sort_order  INT           NOT NULL DEFAULT 0,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_engagement_tiers_slug (slug)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- One row per question, wherever it is asked. `owner` says which block DEFINES it; the
-- inner pages that reuse a shared question point at the same row through faq_placements,
-- so an answer edited once changes everywhere it appears. That is the behaviour the
-- content files already have, where those pages call reusedFaq() rather than retyping.
CREATE TABLE IF NOT EXISTS faq_items (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  faq_key    VARCHAR(160)  NOT NULL COMMENT 'Derived from the question. Stable across answer edits.',
  owner      ENUM('home','creative-services','how-we-work','ways-to-work') NOT NULL DEFAULT 'home',
  has_cta    TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'Whether the answer ends in an inline call to action.',
  sort_order INT           NOT NULL DEFAULT 0,
  created_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_faq_items_key (faq_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faq_placements (
  page_key   VARCHAR(64)  NOT NULL COMMENT 'home, creative-services, how-we-work, ways-to-work.',
  faq_id     INT UNSIGNED NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (page_key, faq_id),
  CONSTRAINT fk_faq_placements_item FOREIGN KEY (faq_id) REFERENCES faq_items (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
