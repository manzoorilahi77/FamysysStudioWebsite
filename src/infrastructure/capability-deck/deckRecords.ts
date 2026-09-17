// src/infrastructure/capability-deck/deckRecords.ts
import type { ContentAddress } from "../../domain/cms/entities/ContentAddress";
import type { CmsRecord, CmsValueKind } from "../../domain/cms/entities/CmsRecord";
import { MediaRef } from "../../domain/shared/value-objects/MediaRef";
import { media, toRecord } from "../cms/records";
import type { GroupInput, ItemGroupInput, ListInput, ValueInput } from "../cms/records";

/**
 * THE DECK'S OWN SOURCE SHAPE — the same plain objects `data/content.ts` already exports,
 * named here so both repositories (Task 6: static, Task 7: database) can produce one and
 * this file does not need to know which produced it.
 *
 * `portfolioCategories` keeps content.ts's own shape (see types.ts's `PortfolioCategory`)
 * rather than a deck-specific reshaping: the seven categories are structurally fixed (see
 * the design note above this task), so there is nothing to gain from inventing a second
 * shape for data that is read exactly once, here.
 */
export interface CapabilityDeckSource {
  readonly cover: {
    readonly brand: string;
    readonly headlineLine1: string;
    readonly headlineAccent: string;
    readonly supporting: string;
    readonly decorativeLabel: string;
    readonly logoMark: string;
  };
  readonly whoWeAre: {
    readonly headline: string;
    readonly copy: string;
    readonly highlights: ReadonlyArray<{ readonly title: string; readonly copy: string }>;
    readonly established: string;
    readonly locations: string;
    readonly visionMission: ReadonlyArray<{ readonly title: string; readonly copy: string }>;
  };
  readonly processSteps: ReadonlyArray<{ readonly index: string; readonly title: string; readonly copy: string }>;
  readonly serviceCategories: ReadonlyArray<{
    readonly title: string;
    readonly tagline: string;
    readonly examples: ReadonlyArray<string>;
  }>;
  readonly engagementModels: ReadonlyArray<{
    readonly tag: string;
    readonly title: string;
    readonly audience: string;
    readonly examples: ReadonlyArray<string>;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- content.ts's own type, imported by the two repositories that populate this field
  readonly portfolioCategories: ReadonlyArray<any>;
  readonly cta: {
    readonly headline: string;
    readonly body: string;
    readonly ctaLabel: string;
    readonly ctaHref: string;
    readonly caption: string;
  };
}

/** A plain editable line, with no static-file pointer — see Task 5's design note on why. */
function textField(label: string, value: string, kind: CmsValueKind = "text"): ValueInput {
  return { label, value, kind, multiline: false };
}

function paragraphField(label: string, value: string): ValueInput {
  return { label, value, kind: "text", multiline: true };
}

/** A list with no per-item pointer — items are still fully writable; see Task 5's design note. */
function textList(label: string, items: ReadonlyArray<string>): ListInput {
  return { label, items };
}

const PLACEHOLDER_ASPECT_RATIO = "16:9";

function imageMedia(label: string, path: string, alt: string): ReturnType<typeof media> {
  return media(
    label,
    MediaRef.create({ kind: "image", src: path, alt, aspectRatio: PLACEHOLDER_ASPECT_RATIO }),
    undefined,
  );
}

/** Every top-level slide is addressed by its own slide id — see `DECK_SLIDE_CATALOG`. */
function slideAddress(slideId: string): ContentAddress {
  return { kind: "deck_slide", key: slideId };
}

/**
 * Every repeatable card inside a slide's item groups is addressed by its collection plus
 * its own record id — the same `${collectionId}:${itemId}` formula `deck_items.item_key`
 * already uses (Task 7's read-overlay, Task 8's seed script), so this is not a new key
 * scheme, just applying the existing one to `.address` too.
 */
function itemAddress(collectionId: string, itemId: string): ContentAddress {
  return { kind: "deck_item", key: `${collectionId}:${itemId}` };
}

// ---------------------------------------------------------------------------
// Cover
// ---------------------------------------------------------------------------

function coverRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const { cover } = source;
  return toRecord({
    id: "cover",
    title: "Cover",
    summary: "The opening slide — brand, headline and the deck's own background mark.",
    updatedAt,
    address: slideAddress("cover"),
    groups: [
      {
        label: "Headline & copy",
        values: [
          textField("Eyebrow", cover.brand),
          textField("Headline, first line", cover.headlineLine1),
          textField("Headline, accent", cover.headlineAccent),
          textField("Supporting line", cover.supporting),
          textField("Corner label", cover.decorativeLabel),
        ],
        // MediaRef.create rejects an empty alt (see MediaRef.ts), so the background mark
        // gets a real descriptive alt rather than the brief's "" — a decorative-image mode
        // with no alt requirement does not exist on MediaRef today.
        media: [imageMedia("Background mark", cover.logoMark, "Famysys Studio logo mark")],
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Who We Are — highlights and vision/mission are fixed at two: the layout is a 2-column
// grid built for exactly that count, so neither is an open item group.
// ---------------------------------------------------------------------------

function whoWeAreRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const { whoWeAre } = source;
  const groups: GroupInput[] = [
    {
      label: "Headline & copy",
      values: [
        textField("Headline", whoWeAre.headline),
        paragraphField("Copy", whoWeAre.copy),
        textField("Established", whoWeAre.established),
        textField("Locations", whoWeAre.locations),
      ],
    },
    ...whoWeAre.highlights.map((h, i): GroupInput => ({
      label: `Highlight ${i + 1}`,
      description: "Fixed at two — the layout is a two-column grid built for this count.",
      values: [textField("Title", h.title), paragraphField("Copy", h.copy)],
    })),
    ...whoWeAre.visionMission.map((v, i): GroupInput => ({
      label: `Vision/Mission ${i + 1}`,
      description: "Fixed at two — the layout is a two-column grid built for this count.",
      values: [textField("Title", v.title), paragraphField("Copy", v.copy)],
    })),
  ];

  return toRecord({
    id: "who-we-are",
    title: "Who We Are",
    summary: "Headline, the two highlights and the two vision/mission statements.",
    updatedAt,
    address: slideAddress("who-we-are"),
    groups,
  });
}

// ---------------------------------------------------------------------------
// How We Work and Services share one shape — an ordered set of {title, copy} cards.
// Services' grid was fixed at 3 columns / 2 rows for exactly 6 cards (see Task 16, which
// switches it to `repeat(auto-fit, minmax(...))` so this open item group is safe to add to).
// ---------------------------------------------------------------------------

function stepLikeRecord(
  slideId: string,
  title: string,
  summary: string,
  collectionId: string,
  cards: ReadonlyArray<{ readonly title: string; readonly copy: string }>,
  updatedAt: Date | null,
): CmsRecord {
  return toRecord({
    id: slideId,
    title,
    summary,
    updatedAt,
    address: slideAddress(slideId),
    items: [
      {
        label: title,
        collectionId,
        canChange: true,
        records: cards.map((card, index) => {
          const itemId = `${collectionId}-${index}`;
          return toRecord({
            id: itemId,
            title: card.title,
            summary: card.copy,
            updatedAt,
            address: itemAddress(collectionId, itemId),
            groups: [{ label: "Copy", values: [textField("Title", card.title), paragraphField("Copy", card.copy)] }],
          });
        }),
      },
    ],
  });
}

function howWeWorkRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  return stepLikeRecord(
    "how-we-work",
    "How We Work",
    "The five (or however many) stages of a project.",
    "how-we-work:steps",
    source.processSteps.map((s) => ({ title: s.title, copy: s.copy })),
    updatedAt,
  );
}

function servicesRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const record = toRecord({
    id: "services",
    title: "Services",
    summary: "The service categories shown as cards.",
    updatedAt,
    address: slideAddress("services"),
    items: [
      {
        label: "Services",
        collectionId: "services:categories",
        canChange: true,
        records: source.serviceCategories.map((category, index) => {
          const itemId = `services-categories-${index}`;
          return toRecord({
            id: itemId,
            title: category.title,
            summary: category.tagline,
            updatedAt,
            address: itemAddress("services:categories", itemId),
            groups: [
              {
                label: "Copy",
                values: [textField("Title", category.title), textField("Tagline", category.tagline)],
                lists: [textList("Examples", category.examples)],
              },
            ],
          });
        }),
      },
    ],
  });
  return record;
}

// ---------------------------------------------------------------------------
// Ways to Work — engagement tiers. The grid is fixed at 4 columns for exactly 4 cards (see
// Task 16), and each card's example list only shows its first 5 entries on the slide.
// ---------------------------------------------------------------------------

function waysToWorkRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  return toRecord({
    id: "ways-to-work",
    title: "Ways to Work",
    summary: "The engagement models shown as cards.",
    updatedAt,
    address: slideAddress("ways-to-work"),
    items: [
      {
        label: "Engagement models",
        collectionId: "ways-to-work:engagements",
        canChange: true,
        records: source.engagementModels.map((tier, index) => {
          const itemId = `ways-to-work-engagements-${index}`;
          return toRecord({
            id: itemId,
            title: tier.title,
            summary: tier.audience,
            updatedAt,
            address: itemAddress("ways-to-work:engagements", itemId),
            groups: [
              {
                label: "Copy",
                values: [
                  textField("Tag", tier.tag),
                  textField("Title", tier.title),
                  paragraphField("Audience", tier.audience),
                ],
                lists: [textList("Examples", tier.examples)],
              },
            ],
          });
        }),
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Let's Talk (CTA)
// ---------------------------------------------------------------------------

function ctaRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const { cta } = source;
  return toRecord({
    id: "lets-talk",
    title: "Let's Talk",
    summary: "The closing call to action.",
    updatedAt,
    address: slideAddress("lets-talk"),
    groups: [
      {
        label: "Copy",
        values: [
          textField("Headline", cta.headline),
          paragraphField("Body", cta.body),
          textField("Button label", cta.ctaLabel, "ctaLabel"),
          textField("Button link", cta.ctaHref, "url"),
          textField("Caption", cta.caption),
        ],
      },
    ],
  });
}

// ---------------------------------------------------------------------------
// Selected Work — flattened per the design note: one field group per category for its
// fixed copy, one top-level item group per category's repeatable content.
// ---------------------------------------------------------------------------

interface DeckVideoLike { readonly title: string; readonly src: string; }
interface DeckProjectLike {
  readonly key: string; readonly title: string; readonly category: string; readonly summary: string;
  readonly bullets: ReadonlyArray<string>; readonly url: string;
  readonly previewUrl?: string; readonly liveUrl?: string; readonly image?: string;
}
interface DeckImageLike { readonly key?: string; readonly title?: string; readonly image?: string; }

function videoItemGroup(label: string, collectionId: string, videos: ReadonlyArray<DeckVideoLike>, updatedAt: Date | null): ItemGroupInput {
  return {
    label,
    collectionId,
    canChange: true,
    records: videos.map((video, index) => {
      const itemId = `${collectionId}-${index}`;
      return toRecord({
        id: itemId,
        title: video.title,
        summary: video.src,
        updatedAt,
        address: itemAddress(collectionId, itemId),
        groups: [
          {
            label: "Copy",
            values: [textField("Title", video.title), textField("Google Drive link", video.src, "driveVideoId")],
          },
        ],
      });
    }),
  };
}

function websiteItemGroup(projects: ReadonlyArray<DeckProjectLike>, updatedAt: Date | null): ItemGroupInput {
  return {
    label: "Websites",
    collectionId: "selected-work:websites",
    canChange: true,
    records: projects.map((project) =>
      toRecord({
        id: project.key,
        title: project.title,
        summary: project.summary,
        updatedAt,
        address: itemAddress("selected-work:websites", project.key),
        groups: [
          {
            label: "Copy",
            values: [
              textField("Title", project.title),
              textField("Category", project.category),
              paragraphField("Summary", project.summary),
              textField("Full-deck link", project.url, "url"),
              ...(project.previewUrl !== undefined
                ? [textField("Live preview URL", project.previewUrl, "websiteOrigin")]
                : []),
              ...(project.liveUrl !== undefined
                ? [textField("Opens instead of framing (live URL)", project.liveUrl, "url")]
                : []),
            ],
            lists: [textList("Bullets", project.bullets)],
            ...(project.image !== undefined
              ? { media: [imageMedia("Fallback screenshot", project.image, `${project.title} screenshot`)] }
              : {}),
          },
        ],
      }),
    ),
  };
}

function printItemGroup(label: string, collectionId: string, images: ReadonlyArray<DeckImageLike>, updatedAt: Date | null): ItemGroupInput {
  return {
    label,
    collectionId,
    canChange: true,
    records: images.map((image, index) => {
      const title = image.title ?? `${label} ${index + 1}`;
      const itemId = image.key ?? `${collectionId}-${index}`;
      return toRecord({
        id: itemId,
        title,
        summary: label,
        updatedAt,
        address: itemAddress(collectionId, itemId),
        groups: [
          {
            label: "Image",
            values: [textField("Title", title)],
            media: [imageMedia("File", image.image ?? "", `${title}`)],
          },
        ],
      });
    }),
  };
}

function selectedWorkRecord(source: CapabilityDeckSource, updatedAt: Date | null): CmsRecord {
  const byKey = new Map(source.portfolioCategories.map((c) => [c.key as string, c]));
  const groups: GroupInput[] = [];
  const items: ItemGroupInput[] = [];

  for (const key of ["ugc", "motion-graphics", "synthesia", "ai-video"] as const) {
    const category = byKey.get(key);
    if (!category) continue;
    groups.push({
      label: `${category.label} — copy`,
      values: [
        textField("Tab label", category.label),
        ...(category.process
          ? [paragraphField("What you send (input)", category.process.input), paragraphField("What comes back (output)", category.process.output)]
          : []),
      ],
    });
    items.push(videoItemGroup(`${category.label} videos`, `selected-work:${key}`, category.videos ?? [], updatedAt));
  }

  const websites = byKey.get("websites");
  if (websites) {
    groups.push({ label: "Websites — copy", values: [textField("Tab label", websites.label)] });
    items.push(websiteItemGroup(websites.projects ?? [], updatedAt));
  }

  const print = byKey.get("print-design");
  if (print) {
    groups.push({
      label: "Digital Print & Design — copy",
      values: [
        textField("Tab label", print.label),
        ...(print.copy ? [paragraphField("Tab intro", print.copy)] : []),
        ...(print.process
          ? [paragraphField("What you send (input)", print.process.input), paragraphField("What comes back (output)", print.process.output)]
          : []),
      ],
    });
    for (const sub of print.subcategories ?? []) {
      items.push(printItemGroup(`${sub.label}`, `selected-work:print:${sub.key}`, sub.images ?? [], updatedAt));
    }
  }

  const presentation = byKey.get("presentation");
  if (presentation) {
    groups.push({
      label: "Presentation — copy",
      values: [
        textField("Tab label", presentation.label),
        textField("Title", presentation.title ?? ""),
        textField("Category", presentation.category ?? ""),
        paragraphField("Summary", presentation.summary ?? ""),
        textField("Full-deck link", presentation.url ?? "", "url"),
        textField("Embed URL", presentation.embedUrl ?? "", "websiteOrigin"),
      ],
      lists: [textList("Bullets", presentation.bullets ?? [])],
    });
  }

  return toRecord({
    id: "selected-work",
    title: "Selected Work",
    summary: "The seven portfolio categories: their copy, and every video, website entry and print image inside them.",
    updatedAt,
    address: slideAddress("selected-work"),
    groups,
    items,
  });
}

// ---------------------------------------------------------------------------

const BUILDERS: ReadonlyArray<[string, (source: CapabilityDeckSource, updatedAt: Date | null) => CmsRecord]> = [
  ["cover", coverRecord],
  ["who-we-are", whoWeAreRecord],
  ["how-we-work", howWeWorkRecord],
  ["services", servicesRecord],
  ["selected-work", selectedWorkRecord],
  ["ways-to-work", waysToWorkRecord],
  ["lets-talk", ctaRecord],
];

/** One `CmsRecord` per catalog slide key, in `DECK_SLIDE_CATALOG` order — never filtered here. */
export function buildDeckSlideRecords(
  source: CapabilityDeckSource,
  updatedAt: Date | null,
): ReadonlyMap<string, CmsRecord> {
  return new Map(BUILDERS.map(([slideKey, build]) => [slideKey, build(source, updatedAt)]));
}
