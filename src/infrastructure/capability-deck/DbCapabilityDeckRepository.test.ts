// src/infrastructure/capability-deck/DbCapabilityDeckRepository.test.ts
import { describe, expect, it, vi, beforeEach } from "vitest";

const rows = vi.hoisted(() => ({ deckSlides: [] as any[], deckItems: [] as any[], contentStrings: [] as any[] }));

vi.mock("../db/content/cache", () => ({
  cachedRows: vi.fn(async (sql: string) => {
    if (sql.includes("FROM deck_slides")) return rows.deckSlides;
    if (sql.includes("FROM deck_items")) return rows.deckItems;
    if (sql.includes("FROM content_strings")) return rows.contentStrings;
    return [];
  }),
}));
vi.mock("../db/pool", () => ({
  transaction: vi.fn(async (fn: any) => fn({ execute: vi.fn(async () => [[], {}]) })),
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
});
