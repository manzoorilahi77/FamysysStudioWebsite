// src/application/capability-deck/GetCapabilityDeckNavigation.test.ts
import { describe, expect, it } from "vitest";
import { FakeCapabilityDeckRepository } from "./__fakes__/FakeCapabilityDeckRepository";
import { GetCapabilityDeckNavigation } from "./GetCapabilityDeckNavigation";
import { buildDeckSlideRecords } from "../../infrastructure/capability-deck/deckRecords";
import { staticDeckSource } from "../../infrastructure/capability-deck/StaticCapabilityDeckRepository";

describe("GetCapabilityDeckNavigation", () => {
  it("lists every current slide with its edit href, and every available slide type", async () => {
    const records = buildDeckSlideRecords(staticDeckSource(), null);
    const repo = new FakeCapabilityDeckRepository({
      slides: [records.get("cover")!, records.get("who-we-are")!],
      availableSlides: [{ slideKey: "services", label: "Services" }],
      updatedAt: null,
    });
    const nav = await new GetCapabilityDeckNavigation(repo).execute();
    expect(nav.slides.map((s) => s.href)).toEqual([
      "/admin/capability-deck/cover",
      "/admin/capability-deck/who-we-are",
    ]);
    expect(nav.availableSlides).toEqual([{ slideKey: "services", label: "Services" }]);
  });
});
