-- db/migrations/015_capability_deck.sql
--
-- THE CAPABILITY DECK'S OWN STRUCTURE, alongside the seven pages' rather than inside it.
--
-- deck_slides is which of the seven known slide types (see DeckSlideCatalog.ts) is
-- currently placed in the deck, and in what order -- a slide_key present here is "in the
-- deck"; one from the catalog absent here is "known in code, not currently shown", which is
-- exactly what the panel's "Add a slide" offers a choice from.
--
-- deck_items is every repeatable card inside a slide's item groups -- a Selected Work
-- video, a Selected Work website entry, a print-gallery image, a Services category, a Ways
-- to Work engagement tier -- one row each, ordered by sort_order the same way
-- capabilities/process_steps/engagement_tiers already are. `collection_id` is the same
-- kind of closed, code-only key CREATABLE_COLLECTIONS already uses
-- ("selected-work:ugc", "selected-work:websites", "selected-work:print-design:banners",
-- "services:categories", "ways-to-work:engagements", "how-we-work:steps") -- never a
-- string a request supplies verbatim into a query.
--
-- media_path/media_kind are populated only for image-kind items (the print gallery); a
-- video item's Drive link and a website item's URL are plain copy, validated by
-- 'driveVideoId'/'websiteOrigin' and stored in content_strings like any other field --
-- exactly the split capabilities.media_path already draws between a structural file and
-- copy that describes it.
--
-- Every editable STRING on a slide or an item -- its title, its Drive link, its website
-- URL, an alt text -- lives in content_strings, addressed
-- ('deck_slide', '<slideKey>', '<field>') or ('deck_item', '<collectionId>:<slug>', '<field>'),
-- which is why those two owner_kind values are added to the existing ENUM rather than a
-- parallel strings table being created for them.

CREATE TABLE IF NOT EXISTS deck_slides (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  slide_key  VARCHAR(64)   NOT NULL COMMENT 'Matches DeckSlideCatalogEntry.slideKey and SlideEntry.id.',
  sort_order INT           NOT NULL DEFAULT 0,
  created_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_deck_slides_key (slide_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deck_items (
  id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  item_key      VARCHAR(160)  NOT NULL COMMENT '"<collectionId>:<slug>" -- the owner_key content_strings addresses this item by.',
  collection_id VARCHAR(96)   NOT NULL COMMENT 'Which item group this card belongs to -- a closed, code-only key.',
  media_path    VARCHAR(191)  NULL COMMENT 'Set only for image-kind collections (the print gallery).',
  media_kind    ENUM('image','video') NULL,
  sort_order    INT           NOT NULL DEFAULT 0,
  created_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_deck_items_key (item_key),
  KEY ix_deck_items_collection (collection_id, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Widen the two owner_kind ENUMs (previously 'page_section','collection_record','media_asset',
-- set in 003 and 008) to admit the deck's two owner kinds.
ALTER TABLE content_strings
  MODIFY COLUMN owner_kind ENUM(
    'page_section', 'collection_record', 'media_asset', 'deck_slide', 'deck_item'
  ) NOT NULL;

ALTER TABLE content_drafts
  MODIFY COLUMN owner_kind ENUM(
    'page_section', 'collection_record', 'media_asset', 'deck_slide', 'deck_item'
  ) NOT NULL;

-- Widen value_kind (previously widened in 012 and 014) to admit the deck's two field kinds.
ALTER TABLE content_strings
  MODIFY COLUMN value_kind ENUM(
    'text', 'ctaLabel', 'url', 'mediaAlt', 'mediaSrc', 'mediaPoster',
    'seoTitle', 'seoDescription', 'seoCanonical', 'driveVideoId', 'websiteOrigin'
  )
    NOT NULL DEFAULT 'text'
    COMMENT 'Which domain value object validates a write. Mirrors CmsValueKind.';
