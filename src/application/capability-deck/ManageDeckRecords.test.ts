// src/application/capability-deck/ManageDeckRecords.test.ts
import { describe, expect, it } from "vitest";
import { FakeCapabilityDeckRepository } from "./__fakes__/FakeCapabilityDeckRepository";
import { AddDeckSlide, RemoveDeckSlide, ReorderDeckSlides, CreateDeckItem, DeleteDeckItem, ReorderDeckItems } from "./ManageDeckRecords";
import { buildDeckSlideRecords } from "../../infrastructure/capability-deck/deckRecords";
import { staticDeckSource } from "../../infrastructure/capability-deck/StaticCapabilityDeckRepository";

function fakeDeck(slideKeys: ReadonlyArray<string>) {
  const records = buildDeckSlideRecords(staticDeckSource(), null);
  const all = [...records.entries()];
  return new FakeCapabilityDeckRepository({
    slides: slideKeys.map((key) => records.get(key)!),
    availableSlides: all.filter(([key]) => !slideKeys.includes(key)).map(([slideKey, r]) => ({ slideKey, label: r.title, inDefaultDeck: false })),
    updatedAt: null,
  });
}

describe("AddDeckSlide", () => {
  it("refuses an unknown slide key", async () => {
    const result = await new AddDeckSlide(fakeDeck(["cover"])).execute("not-a-real-slide", null);
    expect(result.ok).toBe(false);
  });

  it("refuses a slide already in the deck", async () => {
    const result = await new AddDeckSlide(fakeDeck(["cover", "who-we-are"])).execute("cover", null);
    expect(result.ok).toBe(false);
  });
});

describe("RemoveDeckSlide", () => {
  it("refuses to remove a slide that is not currently in the deck", async () => {
    const result = await new RemoveDeckSlide(fakeDeck(["cover"])).execute("services");
    expect(result.ok).toBe(false);
  });
});

describe("ReorderDeckSlides", () => {
  it("refuses a reorder that does not name exactly the slides currently in the deck", async () => {
    const result = await new ReorderDeckSlides(fakeDeck(["cover", "who-we-are"])).execute(["cover"]);
    expect(result.ok).toBe(false);
  });
});

describe("CreateDeckItem", () => {
  it("refuses a blank title", async () => {
    const result = await new CreateDeckItem(fakeDeck(["selected-work"])).execute("selected-work:ugc", {
      slug: "", title: "  ", summary: "x",
    });
    expect(result.ok).toBe(false);
  });
});

describe("DeleteDeckItem", () => {
  it("refuses an item id that is not on the named collection", async () => {
    const result = await new DeleteDeckItem(fakeDeck(["selected-work"])).execute("selected-work:ugc", "not-a-real-item");
    expect(result.ok).toBe(false);
  });
});

describe("ReorderDeckItems", () => {
  it("refuses a reorder that does not name exactly the items currently in the collection", async () => {
    const result = await new ReorderDeckItems(fakeDeck(["selected-work"])).execute("selected-work:ugc", []);
    expect(result.ok).toBe(false);
  });
});
