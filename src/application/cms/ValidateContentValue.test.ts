import { describe, expect, it } from "vitest";
import { validateContentValue } from "./ValidateContentValue";
import type { CmsValue, CmsValueKind } from "../../domain/cms/entities/CmsRecord";

/**
 * A VIDEO AND ITS POSTER ARE ONE DECISION MADE IN TWO FIELDS.
 *
 * `MediaRef` refuses to build a video reference without a still, so a save that set only the
 * file would write a record the site throws on. These tests pin the pairing, and in
 * particular the case that is easy to get wrong: validating against what is STORED would
 * reject the only save that can ever be legal — the one that sets both at once.
 */

function value(kind: CmsValueKind, id = "field"): CmsValue {
  return {
    id,
    label: "Field",
    value: "",
    kind,
    multiline: false,
    approval: "drafted",
    usedElsewhere: [],
  };
}

const SRC = value("mediaSrc");
const POSTER = value("mediaPoster");

describe("mediaSrc", () => {
  it("accepts an image under /media/", () => {
    expect(validateContentValue(SRC, "/media/hero.jpg", {})).toBeNull();
  });

  it("refuses a path outside /media/, however well-formed", () => {
    // Arrange: a valid URL and a valid root-relative path, neither of which this site serves.
    // Act / Assert
    expect(validateContentValue(SRC, "https://cdn.example/tracker.gif", {})).toContain("/media/");
    expect(validateContentValue(SRC, "/etc/passwd", {})).toContain("/media/");
  });

  it("refuses traversal that starts inside /media/", () => {
    expect(validateContentValue(SRC, "/media/../../secret.jpg", {})).toContain("/media/");
  });

  it("accepts a video when the poster being saved beside it is an image", () => {
    // Arrange: the state a single save produces — both fields set together.
    const context = { poster: "/media/still.jpg" };

    // Act
    const rejection = validateContentValue(SRC, "/media/clip.mp4", context);

    // Assert
    expect(rejection).toBeNull();
  });

  it("refuses a video with no poster beside it", () => {
    // Arrange: the half-applied state — a file swapped without its still.
    // Act
    const rejection = validateContentValue(SRC, "/media/clip.mp4", { poster: "" });

    // Assert: the domain's own words, not a second rule written for the panel.
    expect(rejection).toContain("poster");
  });
});

describe("mediaPoster", () => {
  it("may be empty while the file is an image", () => {
    expect(validateContentValue(POSTER, "", { src: "/media/hero.jpg" })).toBeNull();
  });

  it("may not be emptied while the file is a video", () => {
    const rejection = validateContentValue(POSTER, "", { src: "/media/clip.mp4" });
    expect(rejection).toContain("video");
  });

  it("has to be an image, because it is the still shown before a video plays", () => {
    const rejection = validateContentValue(POSTER, "/media/other.mp4", { src: "/media/clip.mp4" });
    expect(rejection).toContain("image");
  });

  it("accepts an image under /media/ for a video", () => {
    expect(
      validateContentValue(POSTER, "/media/still.jpg", { src: "/media/clip.mp4" }),
    ).toBeNull();
  });
});

describe("driveVideoId", () => {
  const field = { id: "src", label: "Video", value: "", kind: "driveVideoId" as const, multiline: false, approval: "drafted" as const, usedElsewhere: [] };

  it("accepts a Drive share link", () => {
    expect(validateContentValue(field, "https://drive.google.com/file/d/abc123/view")).toBeNull();
  });

  it("rejects a non-Drive URL", () => {
    expect(validateContentValue(field, "https://example.com/video.mp4")).toMatch(/Google Drive/);
  });

  it("rejects empty", () => {
    expect(validateContentValue(field, "")).toBe("This cannot be empty.");
  });
});

describe("websiteOrigin", () => {
  const field = { id: "previewUrl", label: "Live preview", value: "", kind: "websiteOrigin" as const, multiline: false, approval: "drafted" as const, usedElsewhere: [] };

  it("accepts an allowlisted origin", () => {
    expect(validateContentValue(field, "https://www.bashafood.in/")).toBeNull();
  });

  it("rejects an origin that is not allowlisted, naming the allowed ones", () => {
    const message = validateContentValue(field, "https://not-allowed.example/");
    expect(message).toMatch(/bashafood\.in/);
  });
});
