// src/infrastructure/capability-deck/deckRecords.test.ts
import { describe, expect, it } from "vitest";
import { buildDeckSlideRecords } from "./deckRecords";
import * as content from "../../presentation/capability-deck/data/content";
import type { CapabilityDeckSource } from "../../domain/capability-deck/entities/CapabilityDeckSource";

function fixtureSource(): CapabilityDeckSource {
  return {
    cover: content.coverContent,
    whoWeAre: content.whoWeAre,
    processSteps: content.processSteps,
    serviceCategories: content.serviceCategories,
    engagementModels: content.engagementModels,
    portfolioCategories: content.portfolioCategories,
    cta: content.ctaContent,
  };
}

describe("buildDeckSlideRecords", () => {
  it("builds one record per catalog slide key", () => {
    const records = buildDeckSlideRecords(fixtureSource(), null);
    expect([...records.keys()]).toEqual([
      "cover", "who-we-are", "how-we-work", "services", "selected-work", "ways-to-work", "lets-talk",
    ]);
  });

  it("who-we-are exposes the headline as an editable text field", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("who-we-are")!;
    const group = record.groups.find((g) => g.label === "Headline & copy")!;
    const headline = group.values.find((v) => v.label === "Headline")!;
    expect(headline.value).toBe(content.whoWeAre.headline);
    expect(headline.kind).toBe("text");
  });

  it("who-we-are's highlights are not an open item group (fixed at two)", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("who-we-are")!;
    expect(record.items.some((g) => g.label === "Highlights")).toBe(false);
  });

  it("services exposes an open item group of category cards", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("services")!;
    const group = record.items.find((g) => g.collectionId === "services:categories")!;
    expect(group.canChange).toBe(true);
    expect(group.records).toHaveLength(content.serviceCategories.length);
  });

  it("selected-work exposes one item group per video-bearing category, each keyed by a driveVideoId field", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("selected-work")!;
    const ugc = record.items.find((g) => g.collectionId === "selected-work:ugc")!;
    expect(ugc.records.length).toBeGreaterThan(0);
    const firstVideo = ugc.records[0]!;
    const srcField = firstVideo.groups[0]!.values.find((v) => v.kind === "driveVideoId")!;
    expect(srcField.value).toMatch(/drive\.google\.com/);
  });

  it("selected-work's website entries expose previewUrl/liveUrl as websiteOrigin fields", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("selected-work")!;
    const websites = record.items.find((g) => g.collectionId === "selected-work:websites")!;
    const basha = websites.records.find((r) => r.id === "basha")!;
    const previewUrl = basha.groups[0]!.values.find((v) => v.label === "Live preview URL")!;
    expect(previewUrl.kind).toBe("websiteOrigin");
    expect(previewUrl.value).toBe("https://www.bashafood.in/");
  });

  it("selected-work's print galleries expose an image media block per subcategory", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("selected-work")!;
    const banners = record.items.find((g) => g.collectionId === "selected-work:print:banners")!;
    expect(banners.records[0]!.groups[0]!.media).toHaveLength(1);
  });

  it("cover and lets-talk read their copy from the new content.ts exports", () => {
    const records = buildDeckSlideRecords(fixtureSource(), null);
    const cover = records.get("cover")!;
    expect(cover.groups[0]!.values.some((v) => v.value === content.coverContent.headlineLine1)).toBe(true);
    const cta = records.get("lets-talk")!;
    expect(cta.groups[0]!.values.some((v) => v.value === content.ctaContent.headline)).toBe(true);
  });

  it("every top-level slide record carries a deck_slide address", () => {
    const cover = buildDeckSlideRecords(fixtureSource(), null).get("cover")!;
    expect(cover.address).toEqual({ kind: "deck_slide", key: "cover" });
  });

  it("selected-work's video items carry a deck_item address keyed by their collection", () => {
    const record = buildDeckSlideRecords(fixtureSource(), null).get("selected-work")!;
    const ugc = record.items.find((g) => g.collectionId === "selected-work:ugc")!;
    const firstVideo = ugc.records[0]!;
    expect(firstVideo.address).toEqual({
      kind: "deck_item",
      key: `selected-work:ugc:${firstVideo.id}`,
    });
  });
});
