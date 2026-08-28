import { describe, expect, it } from "vitest";
import { InvalidMediaRefError } from "../errors/ValueObjectErrors";
import { MediaRef } from "./MediaRef";

describe("MediaRef", () => {
  it("creates an image MediaRef without a poster", () => {
    const media = MediaRef.create({
      kind: "image",
      src: "/media/placeholder-01.svg",
      alt: "Abstract geometric placeholder",
      aspectRatio: "16:9",
    });

    expect(media.kind).toBe("image");
    expect(media.src.value).toBe("/media/placeholder-01.svg");
    expect(media.poster).toBeUndefined();
  });

  it("creates a video MediaRef with a poster", () => {
    const media = MediaRef.create({
      kind: "video",
      src: "/media/loop-01.mp4",
      poster: "/media/loop-01-poster.svg",
      alt: "Slow gradient drift loop",
      aspectRatio: "16:9",
    });

    expect(media.kind).toBe("video");
    expect(media.poster?.value).toBe("/media/loop-01-poster.svg");
  });

  it("throws InvalidMediaRefError when video media has no poster", () => {
    expect(() =>
      MediaRef.create({
        kind: "video",
        src: "/media/loop-01.mp4",
        alt: "Slow gradient drift loop",
        aspectRatio: "16:9",
      }),
    ).toThrow(InvalidMediaRefError);
  });

  it("throws InvalidMediaRefError when alt text is empty", () => {
    expect(() =>
      MediaRef.create({
        kind: "image",
        src: "/media/placeholder-01.svg",
        alt: "   ",
        aspectRatio: "1:1",
      }),
    ).toThrow(InvalidMediaRefError);
  });

  it("propagates an invalid src through the underlying Url value object", () => {
    expect(() =>
      MediaRef.create({
        kind: "image",
        src: "not-a-valid-src",
        alt: "Abstract geometric placeholder",
        aspectRatio: "4:3",
      }),
    ).toThrow();
  });
});
