/**
 * WHAT A MEDIA FILE IS ALLOWED TO BE, DECIDED BY ITS BYTES.
 *
 * An extension is a claim the uploader makes, and a `Content-Type` is a claim the browser
 * makes on their behalf. Neither is evidence. So the type is read from the front of the file
 * and the extension is then CHOSEN by this module rather than taken from the upload — which
 * is what makes "a .jpg that is really an HTML document" impossible to store rather than
 * merely unlikely, and takes the whole question of a hostile filename off the table at the
 * same time.
 *
 * The list is short on purpose. These are the formats the site already serves or could serve
 * tomorrow; anything else is refused with the list rather than silently accepted and left to
 * fail in a browser somewhere.
 */

export interface MediaType {
  readonly extension: string;
  readonly kind: "image" | "video";
  readonly label: string;
}

/** Longest signature first where two share a prefix, so the more specific one wins. */
interface Signature {
  readonly type: MediaType;
  /** Byte values, `null` for "anything" — the four-byte box length in an ISO-BMFF header. */
  readonly magic: ReadonlyArray<number | null>;
  readonly offset: number;
}

const JPEG: MediaType = { extension: "jpg", kind: "image", label: "JPEG image" };
const PNG: MediaType = { extension: "png", kind: "image", label: "PNG image" };
const WEBP: MediaType = { extension: "webp", kind: "image", label: "WebP image" };
const AVIF: MediaType = { extension: "avif", kind: "image", label: "AVIF image" };
const GIF: MediaType = { extension: "gif", kind: "image", label: "GIF image" };
const MP4: MediaType = { extension: "mp4", kind: "video", label: "MP4 video" };
const WEBM: MediaType = { extension: "webm", kind: "video", label: "WebM video" };

/** `ftyp` at offset 4 is ISO base media — MP4, and also AVIF, so the brand decides. */
const FTYP = [0x66, 0x74, 0x79, 0x70];
const ascii = (text: string): ReadonlyArray<number> => [...text].map((c) => c.codePointAt(0) ?? 0);

const SIGNATURES: ReadonlyArray<Signature> = [
  { type: JPEG, magic: [0xff, 0xd8, 0xff], offset: 0 },
  { type: PNG, magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], offset: 0 },
  { type: GIF, magic: ascii("GIF8"), offset: 0 },
  { type: WEBM, magic: [0x1a, 0x45, 0xdf, 0xa3], offset: 0 },
  // RIFF....WEBP — the four bytes between are the file length and are not checked.
  { type: WEBP, magic: [...ascii("RIFF"), null, null, null, null, ...ascii("WEBP")], offset: 0 },
  { type: AVIF, magic: [...FTYP, ...ascii("avif")], offset: 4 },
  { type: AVIF, magic: [...FTYP, ...ascii("avis")], offset: 4 },
  { type: MP4, magic: FTYP, offset: 4 },
];

function matches(bytes: Uint8Array, signature: Signature): boolean {
  return signature.magic.every((expected, index) => {
    if (expected === null) return true;
    return bytes[signature.offset + index] === expected;
  });
}

/** `null` when nothing recognises it. The caller turns that into the message. */
export function sniffMediaType(bytes: Uint8Array): MediaType | null {
  return SIGNATURES.find((signature) => matches(bytes, signature))?.type ?? null;
}

/** For the message when nothing matches, and for the file picker's `accept`. */
export const ACCEPTED_EXTENSIONS: ReadonlyArray<string> = [
  "jpg",
  "png",
  "webp",
  "avif",
  "gif",
  "mp4",
  "webm",
];

/**
 * SIZE CAPS, per kind rather than one number.
 *
 * A 40 MB image is a mistake — the site's heaviest photograph is 682 kB and the optimiser
 * is switched off, so a file that size would be served to every visitor at that size. A
 * 40 MB video is a short clip. One cap would either wave the first through or refuse the
 * second.
 */
export const MAX_BYTES: Readonly<Record<"image" | "video", number>> = {
  image: 12 * 1024 * 1024,
  video: 96 * 1024 * 1024,
};

export function describeBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} kB`;
}
