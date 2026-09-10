import type {
  MediaStore,
  StoredMedia,
  UploadedFile,
} from "../../domain/cms/repositories/MediaStore";
import { ACCEPTED_EXTENSIONS, MAX_BYTES, describeBytes, sniffMediaType } from "./mediaTypes";

/**
 * PUTTING A FILE WHERE THE SITE CAN SERVE IT — AND NOTHING ELSE.
 *
 * This use case does not touch content. It stores bytes and reports a path; whether any
 * record points at that path is a separate decision the editor makes afterwards, in the
 * form, and does not take effect until they Save and then Publish.
 *
 * That separation is the point. An upload that also rewrote the record would be a fourth
 * verb beside save, preview and publish — one that changed the site with no draft in
 * between and no way to preview what it did. It would also be the only irreversible one:
 * every other action on this screen can be discarded.
 *
 * An orphaned file is the acceptable cost. Someone uploads a picture, changes their mind,
 * and a file sits in `public/media` that no record names. That is a few hundred kilobytes
 * and a tidy-up job. The alternative — deleting on cancel — deletes a file that a DIFFERENT
 * record may have started pointing at in the meantime, and that is a broken page.
 */

export type UploadResult =
  | { readonly ok: true; readonly media: StoredMedia }
  | { readonly ok: false; readonly message: string };

export class UploadMedia {
  constructor(private readonly store: MediaStore) {}

  async execute(file: UploadedFile): Promise<UploadResult> {
    if (file.bytes.byteLength === 0) {
      return { ok: false, message: "That file is empty." };
    }

    // The type is read from the bytes BEFORE the size is judged, because the cap depends on
    // which kind it turned out to be.
    const type = sniffMediaType(file.bytes);
    if (!type) {
      return {
        ok: false,
        message: `That file is not one this site can serve. Accepted: ${ACCEPTED_EXTENSIONS.join(", ")}.`,
      };
    }

    const cap = MAX_BYTES[type.kind];
    if (file.bytes.byteLength > cap) {
      return {
        ok: false,
        message: `That ${type.label.toLowerCase()} is ${describeBytes(file.bytes.byteLength)}. The limit for ${type.kind} is ${describeBytes(cap)}.`,
      };
    }

    return { ok: true, media: await this.store.put(file, type) };
  }
}
