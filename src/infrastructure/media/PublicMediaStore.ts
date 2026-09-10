import { createHash } from "node:crypto";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  MediaStore,
  StoredMedia,
  UploadedFile,
} from "../../domain/cms/repositories/MediaStore";

/**
 * FILES ON DISK, UNDER `public/media`, WHICH IS WHERE THE SITE ALREADY SERVES THEM FROM.
 *
 * Next serves `public` from disk at request time, so a file written here is reachable on the
 * next request without a rebuild. That is true of `next start` behind PM2, which is how this
 * deploys, and it is the reason there is no upload pipeline beyond "write the file".
 *
 * THE NAME IS A HASH OF THE CONTENTS, and every part of that sentence is doing work.
 *
 * It is a hash, so re-uploading the same picture is not a second copy of it — the write is
 * skipped and the existing path returned. Editors do that constantly: they upload, change
 * their mind about the alt text, and upload the same file again.
 *
 * It is a hash of the CONTENTS, so a name can never collide with a file that is not
 * identical to it, and therefore an upload can never overwrite a file another record is
 * still pointing at. That is the failure this design exists to prevent: "replace the tier
 * image" quietly changing a picture on three other pages because both were called
 * `hero.jpg`.
 *
 * And it is not the uploader's name at all, so a filename with a slash, a `..`, a null byte
 * or a right-to-left override in it cannot reach the filesystem. There is no sanitiser here
 * to get wrong, because the untrusted string is never used.
 *
 * The extension comes from the sniffed type for the same reason. Together they mean the only
 * thing an upload contributes to the path is its bytes.
 */

/**
 * Enough hash to make a collision between two DIFFERENT files not worth reasoning about,
 * short enough that the path is still readable in the panel. 16 hex characters is 64 bits.
 */
const NAME_LENGTH = 16;

const MEDIA_DIRECTORY = join(process.cwd(), "public", "media");

export class PublicMediaStore implements MediaStore {
  async put(
    file: UploadedFile,
    type: { readonly extension: string; readonly kind: "image" | "video" },
  ): Promise<StoredMedia> {
    const digest = createHash("sha256").update(file.bytes).digest("hex").slice(0, NAME_LENGTH);
    const fileName = `${digest}.${type.extension}`;
    const destination = join(MEDIA_DIRECTORY, fileName);

    const wasAlreadyStored = await exists(destination);
    if (!wasAlreadyStored) {
      await mkdir(MEDIA_DIRECTORY, { recursive: true });
      await writeFile(destination, file.bytes);
    }

    return {
      path: `/media/${fileName}`,
      fileName,
      kind: type.kind,
      byteSize: file.bytes.byteLength,
      wasAlreadyStored,
    };
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
