import { describe, expect, it } from "vitest";
import { recordValues } from "../../domain/cms/entities/CmsRecord";
import { staticDeckSource } from "./StaticCapabilityDeckRepository";
import { buildDeckSlideRecords } from "./deckRecords";
import { WHO_WE_ARE_KEYS } from "./getCapabilityDeckContent";

describe("WHO_WE_ARE_KEYS", () => {
  const source = staticDeckSource();
  const record = buildDeckSlideRecords(source, null).get("who-we-are");
  const valueOf = (id: string) => recordValues(record!).find((v) => v.id === id)?.value;

  it("names the field the panel gives each highlight and vision/mission statement", () => {
    expect(record).toBeDefined();
    source.whoWeAre.highlights.forEach((h, i) => {
      expect(valueOf(WHO_WE_ARE_KEYS.highlights[i]!.title)).toBe(h.title);
      expect(valueOf(WHO_WE_ARE_KEYS.highlights[i]!.copy)).toBe(h.copy);
    });
    source.whoWeAre.visionMission.forEach((v, i) => {
      expect(valueOf(WHO_WE_ARE_KEYS.visionMission[i]!.title)).toBe(v.title);
      expect(valueOf(WHO_WE_ARE_KEYS.visionMission[i]!.copy)).toBe(v.copy);
    });
  });
});
