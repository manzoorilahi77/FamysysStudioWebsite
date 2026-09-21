import { describe, expect, it } from "vitest";
import { StaticCapabilityDeckRepository } from "./StaticCapabilityDeckRepository";

describe("StaticCapabilityDeckRepository", () => {
  it("returns the six default-deck slides in catalog order, How We Work left available", async () => {
    const repo = new StaticCapabilityDeckRepository();
    const deck = await repo.getDeck();
    expect(deck.slides.map((s) => s.id)).toEqual([
      "cover", "who-we-are", "services", "selected-work", "ways-to-work", "lets-talk",
    ]);
    expect(deck.availableSlides.map((s) => s.slideKey)).toEqual(["how-we-work"]);
  });

  it("refuses to save a draft, naming the switch to make", async () => {
    const repo = new StaticCapabilityDeckRepository();
    await expect(
      repo.saveDrafts([{ address: { kind: "deck_slide", key: "cover", field: "eyebrow" }, value: "x", baseValue: "y" }]),
    ).rejects.toThrow(/CONTENT_SOURCE=database/);
  });

  it("refuses to add a slide, a website entry, or a reorder", async () => {
    const repo = new StaticCapabilityDeckRepository();
    await expect(repo.addSlide("how-we-work", null)).rejects.toThrow(/CONTENT_SOURCE=database/);
    await expect(repo.createItem("selected-work:websites", { slug: "x", title: "x", summary: "x" })).rejects.toThrow(/CONTENT_SOURCE=database/);
    await expect(repo.reorderSlides(["cover"])).rejects.toThrow(/CONTENT_SOURCE=database/);
  });

  it("reports it cannot preview drafts or change records", () => {
    const repo = new StaticCapabilityDeckRepository();
    expect(repo.supportsDraftPreview).toBe(false);
    expect(repo.supportsRecordChanges).toBe(false);
  });
});
