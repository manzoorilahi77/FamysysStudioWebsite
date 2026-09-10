/**
 * WHERE AN UPLOADED FILE GOES.
 *
 * One method, because there is only one thing the panel does with a file: put it somewhere
 * the site can serve it from, and say what to call it afterwards. Reading is the browser's
 * job — these are public files with public paths — and deleting is deliberately absent: a
 * path can be sitting in a published record, in a draft, and in a record on another page at
 * the same time, and a store with no way to know that has no business offering to remove
 * anything.
 */

/** What the panel hands over: the bytes, and what the browser said the file was called. */
export interface UploadedFile {
  readonly bytes: Uint8Array;
  /** The name from the client. Untrusted — used for its extension and nothing else. */
  readonly clientName: string;
}

export interface StoredMedia {
  /** The site-root path content refers to it by. `/media/<name>`. */
  readonly path: string;
  readonly fileName: string;
  readonly kind: "image" | "video";
  readonly byteSize: number;
  /** True when these exact bytes were already stored and the existing file was reused. */
  readonly wasAlreadyStored: boolean;
}

export interface MediaStore {
  /**
   * `extension` and `kind` are decided by the caller from the file's own bytes, not from
   * anything the upload claimed — see `mediaTypes`. The store is told what it is storing
   * rather than working it out again, so there is exactly one place that can be wrong.
   */
  put(
    file: UploadedFile,
    type: { readonly extension: string; readonly kind: "image" | "video" },
  ): Promise<StoredMedia>;
}
