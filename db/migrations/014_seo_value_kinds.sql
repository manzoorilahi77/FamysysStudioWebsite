-- Widens content_strings.value_kind again (see 012) to add the three kinds the new per-page
-- SEO section validates against: a title capped at 60 characters, a meta description capped
-- at 160, and a canonical path that has to be a real route on the site. Same reasoning as
-- 012 — these are enforced server-side by ValidateContentValue, not merely warned about in
-- the browser, so the ENUM has to accept them before a save can ever be tagged with one.
ALTER TABLE content_strings
  MODIFY COLUMN value_kind ENUM(
    'text', 'ctaLabel', 'url', 'mediaAlt', 'mediaSrc', 'mediaPoster',
    'seoTitle', 'seoDescription', 'seoCanonical'
  )
    NOT NULL DEFAULT 'text'
    COMMENT 'Which domain value object validates a write. Mirrors CmsValueKind.';
