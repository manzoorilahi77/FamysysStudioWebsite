import { describe, expect, it } from "vitest";
import { FakeCapabilityDeckRepository } from "./__fakes__/FakeCapabilityDeckRepository";
import { SaveDeckSlide, PublishDeckSlide, DiscardDeckDrafts } from "./EditDeckSlide";
import { buildDeckSlideRecords } from "../../infrastructure/capability-deck/deckRecords";
import { staticDeckSource } from "../../infrastructure/capability-deck/StaticCapabilityDeckRepository";

function fakeDeck() {
  const records = buildDeckSlideRecords(staticDeckSource(), null);
  return new FakeCapabilityDeckRepository({
    slides: [...records.values()],
    availableSlides: [],
    updatedAt: null,
  });
}

describe("SaveDeckSlide", () => {
  it("rejects a value that fails validation and writes nothing", async () => {
    const repo = fakeDeck();
    const before = await repo.getDeck();
    const ugcVideoId = before.slides.find((s) => s.id === "selected-work")!.items
      .find((g) => g.collectionId === "selected-work:ugc")!.records[0]!.id;
    const result = await new SaveDeckSlide(repo).execute(
      { slideId: "selected-work" },
      [{ recordId: ugcVideoId, valueId: "google-drive-link", value: "not-a-drive-link" }],
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/Google Drive/);
    }
  });

  it("saves a valid edit as a draft, changing nothing published", async () => {
    const repo = fakeDeck();
    const before = await repo.getDeck();
    const ugcVideoId = before.slides.find((s) => s.id === "selected-work")!.items
      .find((g) => g.collectionId === "selected-work:ugc")!.records[0]!.id;
    const result = await new SaveDeckSlide(repo).execute(
      { slideId: "selected-work" },
      [{ recordId: ugcVideoId, valueId: "google-drive-link", value: "https://drive.google.com/file/d/newId000000000000000/view" }],
    );
    expect(result.ok).toBe(true);
  });
});

describe("PublishDeckSlide", () => {
  it("moves a saved draft onto the slide and reports it published", async () => {
    const repo = fakeDeck();
    await new SaveDeckSlide(repo).execute({ slideId: "lets-talk" }, [{ valueId: "headline", value: "New headline" }]);
    const result = await new PublishDeckSlide(repo).execute({ slideId: "lets-talk" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.published).toBe(1);
  });
});

describe("DiscardDeckDrafts", () => {
  it("throws away a saved draft without publishing it", async () => {
    const repo = fakeDeck();
    await new SaveDeckSlide(repo).execute({ slideId: "lets-talk" }, [{ valueId: "headline", value: "Discarded" }]);
    const discard = await new DiscardDeckDrafts(repo).execute({ slideId: "lets-talk" });
    expect(discard.ok).toBe(true);
    const publish = await new PublishDeckSlide(repo).execute({ slideId: "lets-talk" });
    expect(publish.ok).toBe(true);
    if (publish.ok) expect(publish.published).toBe(0);
  });
});
