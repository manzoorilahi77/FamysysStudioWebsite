import { describe, expect, it } from "vitest";
import { UploadMedia } from "./UploadMedia";
import { MAX_BYTES, sniffMediaType } from "./mediaTypes";
import type {
  MediaStore,
  StoredMedia,
  UploadedFile,
} from "../../domain/cms/repositories/MediaStore";

/**
 * The rule these tests exist for: WHAT A FILE IS, IS DECIDED BY ITS BYTES.
 *
 * An extension and a content type are both claims made by whoever is uploading. If either
 * one were trusted, "a .jpg that is really an HTML document" would be storable, and it would
 * then be served from this site's own origin — which is the whole of a stored-XSS bug. So
 * the tests below feed the sniffer a truthful header and a lying filename and assert that
 * the header wins.
 */

const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const MP4_HEADER = new Uint8Array([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
]);
const AVIF_HEADER = new Uint8Array([
  0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
]);
const WEBP_HEADER = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);
const HTML = new Uint8Array([..."<!doctype html>"].map((c) => c.codePointAt(0) ?? 0));

class RecordingStore implements MediaStore {
  readonly calls: Array<{ file: UploadedFile; extension: string; kind: string }> = [];

  async put(
    file: UploadedFile,
    type: { readonly extension: string; readonly kind: "image" | "video" },
  ): Promise<StoredMedia> {
    this.calls.push({ file, extension: type.extension, kind: type.kind });
    return {
      path: `/media/stored.${type.extension}`,
      fileName: `stored.${type.extension}`,
      kind: type.kind,
      byteSize: file.bytes.byteLength,
      wasAlreadyStored: false,
    };
  }
}

function upload(bytes: Uint8Array, clientName = "whatever.jpg") {
  const store = new RecordingStore();
  return { store, run: () => new UploadMedia(store).execute({ bytes, clientName }) };
}

describe("sniffMediaType", () => {
  it("reads the format from the file header, not from the file name", () => {
    expect(sniffMediaType(PNG_HEADER)?.extension).toBe("png");
    expect(sniffMediaType(JPEG_HEADER)?.extension).toBe("jpg");
    expect(sniffMediaType(WEBP_HEADER)?.extension).toBe("webp");
  });

  it("distinguishes AVIF from MP4, which share the ISO base media header", () => {
    // Arrange: both start with a box length and `ftyp`; only the brand differs.
    // Act / Assert
    expect(sniffMediaType(AVIF_HEADER)?.kind).toBe("image");
    expect(sniffMediaType(MP4_HEADER)?.kind).toBe("video");
  });

  it("returns null for a format it does not recognise", () => {
    expect(sniffMediaType(HTML)).toBeNull();
  });
});

describe("UploadMedia", () => {
  it("stores an image under the extension its bytes call for, ignoring the uploaded name", async () => {
    // Arrange: PNG bytes, claiming to be a JPEG.
    const { store, run } = upload(PNG_HEADER, "photo.jpg");

    // Act
    const result = await run();

    // Assert
    expect(result.ok).toBe(true);
    expect(store.calls[0]?.extension).toBe("png");
  });

  it("refuses a file whose bytes are not a format the site can serve", async () => {
    // Arrange: an HTML document named as an image — the stored-XSS shape.
    const { store, run } = upload(HTML, "innocent.jpg");

    // Act
    const result = await run();

    // Assert
    expect(result).toMatchObject({ ok: false });
    expect(result.ok ? "" : result.message).toContain("not one this site can serve");
    expect(store.calls).toHaveLength(0);
  });

  it("refuses an empty file", async () => {
    const result = await upload(new Uint8Array()).run();
    expect(result).toMatchObject({ ok: false, message: "That file is empty." });
  });

  it("judges size against the cap for the kind it turned out to be", async () => {
    // Arrange: an image one byte over the image cap. The same size is legal for video,
    // which is why the cap cannot be chosen before the type is known.
    const oversized = new Uint8Array(MAX_BYTES.image + 1);
    oversized.set(JPEG_HEADER);
    const { store, run } = upload(oversized);

    // Act
    const result = await run();

    // Assert
    expect(result).toMatchObject({ ok: false });
    expect(result.ok ? "" : result.message).toContain("The limit for image is");
    expect(store.calls).toHaveLength(0);
  });

  it("accepts a video that would be over the image cap", async () => {
    // Arrange
    const big = new Uint8Array(MAX_BYTES.image + 1);
    big.set(MP4_HEADER);

    // Act
    const result = await upload(big, "clip.mp4").run();

    // Assert
    expect(result.ok).toBe(true);
  });
});
