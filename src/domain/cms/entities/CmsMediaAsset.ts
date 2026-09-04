/** One file in `public/media`, with the records that reference it. */
export interface CmsMediaAsset {
  /** The file name, which is unique within the library. */
  readonly id: string;
  /** The site-root path the content refers to it by. */
  readonly path: string;
  readonly extension: string;
  readonly byteSize: number;
  readonly updatedAt: Date | null;
  /** Titles of the records whose media points at this file. Empty means unreferenced. */
  readonly usedBy: ReadonlyArray<string>;
}
