// src/infrastructure/capability-deck/DbCapabilityDeckRepository.test.ts
import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Mirrors the shape of the row interfaces `DbCapabilityDeckRepository.ts` declares for its
 * own queries (`DeckSlideRow`, `DeckItemRow`, `ContentStringRow`, `ContentDraftRow`), minus
 * the `RowDataPacket` brand those carry in production — these are plain fixtures, not
 * results actually round-tripped through the mysql2 driver, so a local shape is enough to
 * keep the mock data honest without reaching into infrastructure internals.
 */
interface MockDeckSlideRow {
  slide_key: string;
  sort_order: number;
  updated_at: string;
}
interface MockDeckItemRow {
  item_key: string;
  collection_id: string;
  media_path: string | null;
  media_kind: "image" | "video" | null;
  sort_order: number;
}
interface MockContentStringRow {
  owner_kind: string;
  owner_key: string;
  field_key: string;
  value: string;
  version?: number;
}
interface MockContentDraftRow {
  owner_kind: string;
  owner_key: string;
  field_key: string;
  value: string;
}

const rows = vi.hoisted(() => ({
  deckSlides: [] as MockDeckSlideRow[],
  deckItems: [] as MockDeckItemRow[],
  contentStrings: [] as MockContentStringRow[],
  contentDrafts: [] as MockContentDraftRow[],
}));

/** The one method `transaction()`'s callback ever calls on the connection it is handed. */
interface MockConnection {
  execute: (sql: string, params?: ReadonlyArray<unknown>) => Promise<[unknown, unknown]>;
}

vi.mock("../db/content/cache", () => ({
  cachedRows: vi.fn(async (sql: string) => {
    if (sql.includes("FROM deck_slides")) return rows.deckSlides;
    if (sql.includes("FROM deck_items")) return rows.deckItems;
    if (sql.includes("FROM content_drafts")) return rows.contentDrafts;
    if (sql.includes("FROM content_strings")) return rows.contentStrings;
    return [];
  }),
}));
vi.mock("../db/pool", () => ({
  transaction: vi.fn(async (fn: (connection: MockConnection) => Promise<unknown>) =>
    fn({ execute: vi.fn(async (): Promise<[unknown, unknown]> => [[], {}]) }),
  ),
  write: vi.fn(async () => ({ affectedRows: 1 })),
}));

import { DbCapabilityDeckRepository } from "./DbCapabilityDeckRepository";

beforeEach(() => {
  rows.deckSlides = [
    { slide_key: "cover", sort_order: 0, updated_at: "2026-01-01 00:00:00.000" },
    { slide_key: "who-we-are", sort_order: 1, updated_at: "2026-01-01 00:00:00.000" },
  ];
  rows.deckItems = [];
  rows.contentStrings = [];
  rows.contentDrafts = [];
});

describe("DbCapabilityDeckRepository.getDeck", () => {
  it("orders slides by deck_slides.sort_order and lists the rest as available", async () => {
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    expect(deck.slides.map((s) => s.id)).toEqual(["cover", "who-we-are"]);
    expect(deck.availableSlides.map((s) => s.slideKey)).toEqual([
      "how-we-work", "services", "selected-work", "ways-to-work", "lets-talk",
    ]);
  });

  it("overlays a published content_strings value onto the static-shaped field it matches by field_key", async () => {
    rows.contentStrings = [
      { owner_kind: "deck_slide", owner_key: "cover", field_key: "eyebrow", value: "Edited Brand" },
    ];
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    const cover = deck.slides.find((s) => s.id === "cover")!;
    const eyebrow = cover.groups[0]!.values.find((v) => v.label === "Eyebrow")!;
    expect(eyebrow.value).toBe("Edited Brand");
  });

  it("falls back to the static build's items, unchanged, when deck_items has no rows for that collection yet", async () => {
    rows.deckSlides = [{ slide_key: "how-we-work", sort_order: 0, updated_at: "2026-01-01 00:00:00.000" }];
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    const howWeWork = deck.slides.find((s) => s.id === "how-we-work")!;
    const stepsGroup = howWeWork.items.find((g) => g.collectionId === "how-we-work:steps")!;
    expect(stepsGroup.records.length).toBeGreaterThan(0);
    expect(stepsGroup.records.map((r) => r.id)).toEqual([
      "how-we-work:steps-0", "how-we-work:steps-1", "how-we-work:steps-2", "how-we-work:steps-3", "how-we-work:steps-4",
    ]);
  });

  it("orders and filters an item group's records by deck_items.sort_order/item_key, and overlays a published item field", async () => {
    rows.deckSlides = [{ slide_key: "how-we-work", sort_order: 0, updated_at: "2026-01-01 00:00:00.000" }];
    rows.deckItems = [
      { item_key: "how-we-work:steps:how-we-work:steps-1", collection_id: "how-we-work:steps", media_path: null, media_kind: null, sort_order: 0 },
      { item_key: "how-we-work:steps:how-we-work:steps-0", collection_id: "how-we-work:steps", media_path: null, media_kind: null, sort_order: 1 },
    ];
    rows.contentStrings = [
      {
        owner_kind: "deck_item",
        owner_key: "how-we-work:steps:how-we-work:steps-1",
        field_key: "title",
        value: "Edited Step Title",
      },
    ];
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    const howWeWork = deck.slides.find((s) => s.id === "how-we-work")!;
    const stepsGroup = howWeWork.items.find((g) => g.collectionId === "how-we-work:steps")!;

    // Reordered to the DB's sort_order, and every static record without a deck_items row
    // (steps 2 and 3 here) is left out — the same way an un-placed slide is left out.
    expect(stepsGroup.records.map((r) => r.id)).toEqual(["how-we-work:steps-1", "how-we-work:steps-0"]);

    const editedStep = stepsGroup.records[0]!;
    const title = editedStep.groups[0]!.values.find((v) => v.label === "Title")!;
    expect(title.value).toBe("Edited Step Title");
  });

  it("swaps an item's media path when the row carries an uploaded image", async () => {
    rows.deckSlides = [{ slide_key: "selected-work", sort_order: 0, updated_at: "2026-01-01 00:00:00.000" }];
    rows.deckItems = [
      {
        item_key: "selected-work:print:banners:chennai-sheek-king-menu",
        collection_id: "selected-work:print:banners",
        media_path: "/uploads/custom-banner.jpg",
        media_kind: "image",
        sort_order: 0,
      },
    ];
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    const selectedWork = deck.slides.find((s) => s.id === "selected-work")!;
    const bannersGroup = selectedWork.items.find((g) => g.collectionId === "selected-work:print:banners")!;

    expect(bannersGroup.records).toHaveLength(1);
    const media = bannersGroup.records[0]!.groups[0]!.media[0]!;
    expect(media.path).toBe("/uploads/custom-banner.jpg");
    expect(media.src?.value).toBe("/uploads/custom-banner.jpg");
  });

  it("lays a saved-but-unpublished content_drafts value onto its field as draftValue, and marks the slide as draft", async () => {
    rows.contentDrafts = [
      { owner_kind: "deck_slide", owner_key: "cover", field_key: "eyebrow", value: "Draft Brand" },
    ];
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    const cover = deck.slides.find((s) => s.id === "cover")!;
    const eyebrow = cover.groups[0]!.values.find((v) => v.label === "Eyebrow")!;

    // The published value is untouched — a draft is a layer on top, never a replacement.
    expect(eyebrow.value).not.toBe("Draft Brand");
    expect(eyebrow.draftValue).toBe("Draft Brand");
    expect(cover.status).toBe("draft");
  });

  it("reports a slide with no drafts anywhere in it as published", async () => {
    const repo = new DbCapabilityDeckRepository();
    const deck = await repo.getDeck();
    const cover = deck.slides.find((s) => s.id === "cover")!;
    expect(cover.status).toBe("published");
  });
});
