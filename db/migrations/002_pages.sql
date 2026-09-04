-- PAGES AND THEIR SECTIONS.
--
-- Pages are FIXED — the routes under src/app decide which seven exist, and the CMS can
-- neither add nor remove one. These rows exist so a section can hang off a page and so
-- the panel can order and describe them; they are seeded, never created by an editor.
-- There is deliberately no DELETE path to this table.

CREATE TABLE IF NOT EXISTS pages (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  page_key     VARCHAR(64)    NOT NULL COMMENT 'Route segment under /admin/pages. Matches CmsPage.id.',
  title        VARCHAR(191)   NOT NULL,
  route        VARCHAR(191)   NOT NULL COMMENT 'The public route this page renders at.',
  description  TEXT           NOT NULL,
  source_file  VARCHAR(120)   NOT NULL COMMENT 'The content module it was seeded from, kept as provenance.',
  sort_order   INT            NOT NULL DEFAULT 0,
  created_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_pages_key (page_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS page_sections (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  page_id      INT UNSIGNED   NOT NULL,
  section_key  VARCHAR(96)    NOT NULL COMMENT 'Matches CmsRecord.id within the page.',
  title        VARCHAR(191)   NOT NULL,
  summary      TEXT           NOT NULL,
  sort_order   INT            NOT NULL DEFAULT 0,
  created_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_page_sections (page_id, section_key),
  CONSTRAINT fk_page_sections_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
