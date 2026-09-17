import { describe, expect, it } from "vitest";
import { AllowedWebsiteUrl } from "./AllowedWebsiteUrl";
import { DECK_PREVIEW_ORIGINS } from "../../../shared/site/deckPreviewOrigins";

describe("AllowedWebsiteUrl", () => {
  it("accepts a URL whose origin is on the allowlist", () => {
    const url = AllowedWebsiteUrl.create("https://www.bashafood.in/");
    expect(url.toString()).toBe("https://www.bashafood.in/");
  });

  it("accepts a path under an allowed origin", () => {
    const url = AllowedWebsiteUrl.create("https://ferrobid.aspirasys.in/#/home");
    expect(url.toString()).toBe("https://ferrobid.aspirasys.in/#/home");
  });

  it("rejects a URL whose origin is not on the allowlist, naming every allowed origin", () => {
    expect(() => AllowedWebsiteUrl.create("https://not-allowed.example/")).toThrowError(
      new RegExp(DECK_PREVIEW_ORIGINS.map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")),
    );
  });

  it("rejects a malformed URL", () => {
    expect(() => AllowedWebsiteUrl.create("not a url")).toThrow();
  });

  it("rejects javascript: and data: schemes even if the host string matches", () => {
    expect(() => AllowedWebsiteUrl.create("javascript:alert(1)")).toThrow();
  });
});
