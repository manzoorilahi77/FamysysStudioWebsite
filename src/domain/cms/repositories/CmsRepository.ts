import type { CmsCollection } from "../entities/CmsCollection";
import type { CmsInquiry } from "../entities/CmsInquiry";
import type { CmsMediaAsset } from "../entities/CmsMediaAsset";
import type { CmsPage } from "../entities/CmsPage";
import type { ContentPointer } from "../entities/ContentPointer";

/**
 * WHERE A STRING LIVES, said twice, because there are two stores and they address
 * differently.
 *
 * `pointer` is the source address — a file, a binding, a path to one literal — and is
 * what the file-backed writer splices. `owner` is the record address — which record, which
 * field on it — and is what a row is keyed by. Both are derived by the use case from the
 * read model, and neither is anything a browser sent.
 *
 * A record CREATED in the panel has no pointer at all: there is no literal in any file for
 * it. That is why `owner` exists rather than the database reusing the file's address, and
 * why the pointer is what is optional here.
 */
export interface ContentAddress {
  readonly kind: "page_section" | "collection_record";
  /** "home:hero", "capabilities:creative-design". */
  readonly key: string;
  /** Matches `CmsValue.id` within the record. */
  readonly field: string;
}

/** One string, and what it is to become. */
export interface ContentEdit {
  readonly pointer: ContentPointer;
  readonly owner?: ContentAddress;
  readonly value: string;
  /**
   * The revision the editor loaded, when the store has revisions. The write is conditional
   * on it: a row that has moved on since matches nothing and the save is refused, rather
   * than the newer value being overwritten by an older screen. Absent for the file-backed
   * implementation, which has nothing to compare.
   */
  readonly expectedVersion?: number;
}

/** Raised when a write lost a race. Carries the message the editor should be shown. */
export class ContentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentConflictError";
  }
}

/** What a new collection record needs before it can exist. */
export interface NewCmsRecord {
  /** The record's stable key. Anchors and links resolve by it, so it never changes after. */
  readonly slug: string;
  readonly title: string;
  /** The one-line summary under the title — a descriptor, an intent line, an answer. */
  readonly summary: string;
}

/**
 * The admin panel's one source. It is deliberately a read model over the content the
 * site already renders rather than a second store: the implementation composes the same
 * `PortfolioRepository`, `ServiceCatalogRepository`, `ProcessRepository` and the rest
 * that the pages use, so a CMS list cannot show something a page does not.
 *
 * `applyEdits` is the write half. There are two implementations behind it: one rewrites
 * the TypeScript content files in place, the other updates rows in MySQL. Note what it
 * does NOT take in either case: no file path, no free-form key, no table name. An edit is
 * a `ContentPointer` the read model produced, which is why nothing a browser sends can
 * address a file or a column.
 *
 * `createRecord` and `deleteRecord` exist only where the store can hold a new row.
 * Pages are fixed — the routes under src/app decide which exist — so there is deliberately
 * no equivalent for them, and the file-backed implementation refuses both with a reason
 * rather than pretending.
 */
export interface CmsRepository {
  getPages(): Promise<ReadonlyArray<CmsPage>>;
  getCollections(): Promise<ReadonlyArray<CmsCollection>>;
  getMediaLibrary(): Promise<ReadonlyArray<CmsMediaAsset>>;
  getInquiries(): Promise<ReadonlyArray<CmsInquiry>>;

  /**
   * Writes every edit, or none of them. Validation has already happened in the use case,
   * so a failure here is an I/O, structural or concurrency one — a literal that turned
   * out not to be a literal, a file that moved, a row someone else changed — and is
   * thrown rather than returned.
   */
  applyEdits(edits: ReadonlyArray<ContentEdit>): Promise<void>;

  /** Adds a record to an open collection. Returns the id it can be read back by. */
  createRecord(collectionId: string, record: NewCmsRecord): Promise<string>;

  /** Removes a record and everything hanging off it. */
  deleteRecord(collectionId: string, recordId: string): Promise<void>;

  /** Whether this store can add and remove records at all — the panel asks before offering. */
  readonly supportsRecordChanges: boolean;

  /** Marks an enquiry read or archived. */
  setInquiryStatus(id: string, status: "new" | "read" | "archived"): Promise<void>;
}
