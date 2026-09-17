// src/infrastructure/capability-deck/getCapabilityDeckContent.ts
import { ContentStore } from "../db/content/ContentStore";
import { derivedId } from "../cms/records";
import { cachedRows } from "../db/content/cache";
import { DECK_SLIDE_CATALOG } from "../../domain/capability-deck/entities/DeckSlideCatalog";
import * as staticContent from "../../presentation/capability-deck/data/content";
import type { CapabilityDeckSource } from "./deckRecords";
import type { RowDataPacket } from "mysql2/promise";

export interface PublishedCapabilityDeck {
  readonly enabledSlideKeys: ReadonlyArray<string>;
  readonly source: CapabilityDeckSource;
}

interface DeckItemRow extends RowDataPacket {
  item_key: string;
  collection_id: string;
  media_path: string | null;
  sort_order: number;
}

/** `text(store, "deck_slide", "cover", "Eyebrow", fallback)` — one accessor, every field. */
function text(store: ContentStore, _ownerKind: "deck_slide" | "deck_item", ownerKey: string, label: string, fallback: string): string {
  return store.optional(ownerKey, derivedId(label)) ?? fallback;
}

/**
 * THE DATABASE READING — used only when `CONTENT_SOURCE=database`. Structure (which items
 * exist, in what order, which have an uploaded image) comes from `deck_slides`/`deck_items`;
 * every string comes from `ContentStore`, which is what makes the preview iframe show
 * unpublished words with no extra plumbing here — see `ContentStore.load()`.
 *
 * Built against `content.ts`'s STATIC shapes as the structural template for the parts that
 * are not repeatable (the seven portfolio categories' ratios, which subcategories the print
 * gallery has) — those are fixed in code either way, so there is nothing to read from the
 * database for them.
 */
export async function readDeckContentFromDatabase(): Promise<PublishedCapabilityDeck> {
  const [slideRows, itemRows] = await Promise.all([
    cachedRows<{ slide_key: string } & RowDataPacket>("SELECT slide_key FROM deck_slides ORDER BY sort_order"),
    cachedRows<DeckItemRow>("SELECT item_key, collection_id, media_path, sort_order FROM deck_items ORDER BY collection_id, sort_order"),
  ]);
  const enabledSlideKeys = slideRows.map((r) => r.slide_key);

  const slideStore = await ContentStore.load("deck_slide", DECK_SLIDE_CATALOG.map((e) => e.slideKey));
  const itemStore = await ContentStore.load("deck_item", itemRows.map((r) => r.item_key));

  const itemsFor = (collectionId: string) => itemRows.filter((r) => r.collection_id === collectionId);

  const cover = {
    brand: text(slideStore, "deck_slide", "cover", "Eyebrow", staticContent.coverContent.brand),
    headlineLine1: text(slideStore, "deck_slide", "cover", "Headline, first line", staticContent.coverContent.headlineLine1),
    headlineAccent: text(slideStore, "deck_slide", "cover", "Headline, accent", staticContent.coverContent.headlineAccent),
    supporting: text(slideStore, "deck_slide", "cover", "Supporting line", staticContent.coverContent.supporting),
    decorativeLabel: text(slideStore, "deck_slide", "cover", "Corner label", staticContent.coverContent.decorativeLabel),
    logoMark: slideStore.optional("cover", "media-src") ?? staticContent.coverContent.logoMark,
  };

  const whoWeAre = {
    headline: text(slideStore, "deck_slide", "who-we-are", "Headline", staticContent.whoWeAre.headline),
    copy: text(slideStore, "deck_slide", "who-we-are", "Copy", staticContent.whoWeAre.copy),
    established: text(slideStore, "deck_slide", "who-we-are", "Established", staticContent.whoWeAre.established),
    locations: text(slideStore, "deck_slide", "who-we-are", "Locations", staticContent.whoWeAre.locations),
    // Fixed at two — see deckRecords.ts's design note. Read by position, matching the
    // field labels `whoWeAreRecord` gave each of the two.
    highlights: staticContent.whoWeAre.highlights.map((fallback) => ({
      title: text(slideStore, "deck_slide", "who-we-are", "Title", fallback.title),
      copy: text(slideStore, "deck_slide", "who-we-are", "Copy", fallback.copy),
    })),
    visionMission: staticContent.whoWeAre.visionMission,
  };

  const serviceCategories = itemsFor("services:categories").map((row, i) => {
    const fallback = staticContent.serviceCategories[i];
    return {
      title: text(itemStore, "deck_item", row.item_key, "Title", fallback?.title ?? ""),
      tagline: text(itemStore, "deck_item", row.item_key, "Tagline", fallback?.tagline ?? ""),
      examples: fallback?.examples ?? [],
    };
  });

  const engagementModels = itemsFor("ways-to-work:engagements").map((row, i) => {
    const fallback = staticContent.engagementModels[i];
    return {
      tag: text(itemStore, "deck_item", row.item_key, "Tag", fallback?.tag ?? ""),
      title: text(itemStore, "deck_item", row.item_key, "Title", fallback?.title ?? ""),
      audience: text(itemStore, "deck_item", row.item_key, "Audience", fallback?.audience ?? ""),
      examples: fallback?.examples ?? [],
    };
  });

  const processSteps = itemsFor("how-we-work:steps").map((row, i) => {
    const fallback = staticContent.processSteps[i];
    return {
      index: fallback?.index ?? String(i + 1).padStart(2, "0"),
      title: text(itemStore, "deck_item", row.item_key, "Title", fallback?.title ?? ""),
      copy: text(itemStore, "deck_item", row.item_key, "Copy", fallback?.copy ?? ""),
    };
  });

  // Selected Work's videos/website entries/print images: same one-accessor pattern, applied
  // per category. Shown for one video category and the print gallery; the rest of the six
  // repeat this identically against their own collectionId — see deckRecords.ts's builders
  // for the exact collectionId each one uses.
  function videosFor(collectionId: string, fallback: ReadonlyArray<{ title: string; src: string }>) {
    return itemsFor(collectionId).map((row, i) => ({
      title: text(itemStore, "deck_item", row.item_key, "Title", fallback[i]?.title ?? ""),
      src: text(itemStore, "deck_item", row.item_key, "Google Drive link", fallback[i]?.src ?? ""),
    }));
  }

  const portfolioCategories = staticContent.portfolioCategories.map((category) => {
    if (["ugc", "motion-graphics", "synthesia", "ai-video"].includes(category.key)) {
      return { ...category, videos: videosFor(`selected-work:${category.key}`, category.videos ?? []) };
    }
    if (category.key === "websites") {
      const rows = itemsFor("selected-work:websites");
      return {
        ...category,
        projects: rows.map((row, i) => {
          const fallback = category.projects?.[i];
          return {
            ...fallback,
            title: text(itemStore, "deck_item", row.item_key, "Title", fallback?.title ?? ""),
            summary: text(itemStore, "deck_item", row.item_key, "Summary", fallback?.summary ?? ""),
            url: text(itemStore, "deck_item", row.item_key, "Full-deck link", fallback?.url ?? ""),
            ...(fallback?.previewUrl !== undefined
              ? { previewUrl: text(itemStore, "deck_item", row.item_key, "Live preview URL", fallback.previewUrl) }
              : {}),
          };
        }),
      };
    }
    if (category.key === "print-design") {
      return {
        ...category,
        subcategories: (category.subcategories ?? []).map((sub) => ({
          ...sub,
          images: itemsFor(`selected-work:print:${sub.key}`).map((row) => ({
            key: row.item_key,
            title: text(itemStore, "deck_item", row.item_key, "Title", ""),
            image: row.media_path ?? "",
          })),
        })),
      };
    }
    if (category.key === "presentation") {
      return {
        ...category,
        title: text(slideStore, "deck_slide", "selected-work", "Title", category.title ?? ""),
        embedUrl: text(slideStore, "deck_slide", "selected-work", "Embed URL", category.embedUrl ?? ""),
      };
    }
    return category;
  });

  const cta = {
    headline: text(slideStore, "deck_slide", "lets-talk", "Headline", staticContent.ctaContent.headline),
    body: text(slideStore, "deck_slide", "lets-talk", "Body", staticContent.ctaContent.body),
    ctaLabel: text(slideStore, "deck_slide", "lets-talk", "Button label", staticContent.ctaContent.ctaLabel),
    ctaHref: text(slideStore, "deck_slide", "lets-talk", "Button link", staticContent.ctaContent.ctaHref),
    caption: text(slideStore, "deck_slide", "lets-talk", "Caption", staticContent.ctaContent.caption),
  };

  return {
    enabledSlideKeys,
    source: { cover, whoWeAre, processSteps, serviceCategories, engagementModels, portfolioCategories, cta },
  };
}

/** Every slide, unmodified content.ts values — used when `CONTENT_SOURCE=static`. */
export function readDeckContentFromFiles(): PublishedCapabilityDeck {
  return {
    enabledSlideKeys: DECK_SLIDE_CATALOG.map((e) => e.slideKey),
    source: {
      cover: staticContent.coverContent,
      whoWeAre: staticContent.whoWeAre,
      processSteps: staticContent.processSteps,
      serviceCategories: staticContent.serviceCategories,
      engagementModels: staticContent.engagementModels,
      portfolioCategories: staticContent.portfolioCategories,
      cta: staticContent.ctaContent,
    },
  };
}
