import { describe, expect, it } from "vitest";
import { DriveVideoUrl } from "./DriveVideoUrl";

describe("DriveVideoUrl", () => {
  it("normalizes a /view URL to the canonical /preview form", () => {
    const url = DriveVideoUrl.create("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/view");
    expect(url.toString()).toBe("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview");
  });

  it("normalizes an open?id= URL", () => {
    const url = DriveVideoUrl.create("https://drive.google.com/open?id=1RnvYjZq6x727HBbUsALsJwxuKrLvePXS");
    expect(url.toString()).toBe("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview");
  });

  it("accepts an already-canonical /preview URL unchanged", () => {
    const url = DriveVideoUrl.create("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview");
    expect(url.toString()).toBe("https://drive.google.com/file/d/1RnvYjZq6x727HBbUsALsJwxuKrLvePXS/preview");
  });

  it("rejects a URL with no recognisable Drive file id", () => {
    expect(() => DriveVideoUrl.create("https://example.com/video.mp4")).toThrow(
      /Google Drive/,
    );
  });

  it("rejects an empty string", () => {
    expect(() => DriveVideoUrl.create("   ")).toThrow();
  });
});
