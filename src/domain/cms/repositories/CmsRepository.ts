import type { CmsInquiry, CmsInquiryStatus } from "../entities/CmsInquiry";
import type { CmsPage } from "../entities/CmsPage";
import type { ContentAddress, ContentFieldAddress } from "../entities/ContentAddress";
import type { ContentPointer } from "../entities/ContentPointer";

/**
 * ONE STRING, AND WHAT IT IS TO BECOME.
 *
 * `address` is the record address — which record, which field on it — and is what every
 * store keys a write by. `pointer` is the SOURCE address — a file, a binding, a path to one
 * literal — and is what the file-backed writer splices; a record created in the panel has
 * no literal in any file, which is why it is the optional half.
 *
 * Both are derived by the use case from the read model. Neither is anything a browser sent,
 * which is what makes "no request can name a file, a table or a column" true by
 * construction rather than by validation.
 */
export interface ContentEdit {
  readonly address: ContentFieldAddress;
  readonly pointer?: ContentPointer;
  readonly value: string;
  /**
   * The PUBLISHED value the editor was looking at when they typed. Stores that have no
   * revision number compare against it instead, so a lost race is detectable in both.
   */
  readonly baseValue: string;
  /**
   * The revision the editor loaded, when the store has revisions. The write is conditional
   * on it: a row that has moved on since matches nothing and the save is refused, rather
   * than the newer value being overwritten by an older screen.
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

/** What a new record needs before it can exist. */
export interface NewCmsRecord {
  /** The record's stable key. Anchors and links resolve by it, so it never changes after. */
  readonly slug: string;
  readonly title: string;
  /** The one-line summary under the title — a descriptor, an intent line, an answer. */
  readonly summary: string;
}

/**
 * THE ADMIN PANEL'S ONE SOURCE.
 *
 * It is deliberately a read model over the content the site already renders rather than a
 * second store: the implementations compose the same `PortfolioRepository`,
 * `ServiceCatalogRepository`, `ProcessRepository` and the rest that the pages use, so the
 * panel cannot show a string the site does not render, and cannot miss one it does.
 *
 * THE WRITE HALF IS THREE STEPS, NOT ONE, and they are three methods for that reason.
 * `saveDrafts` records an edit and changes nothing a visitor can see. `publishDrafts`
 * moves it onto the live content and reports exactly which fields moved, so the caller can
 * regenerate the pages that render them. `discardDrafts` throws the edit away. A store that
 * cannot hold a draft is not asked to pretend it can — see `supportsDrafts`.
 */
export interface CmsRepository {
  /** The seven pages, their sections, and the cards inside them. */
  getPages(): Promise<ReadonlyArray<CmsPage>>;

  getInquiries(): Promise<ReadonlyArray<CmsInquiry>>;

  /** Records an edit against the record it belongs to. The public site does not change. */
  saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void>;

  /**
   * Moves every draft held for these records onto the live content, or none of them.
   * Returns the fields actually written — a publish that wrote nothing revalidates nothing.
   */
  publishDrafts(owners: ReadonlyArray<ContentAddress>): Promise<ReadonlyArray<ContentFieldAddress>>;

  /** Throws away every draft held for these records. */
  discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void>;

  /**
   * Whether the public site can be made to render drafts. True for the database, where a
   * preview lays `content_drafts` over `content_strings` on the way past; false for the
   * TypeScript files, where the only copy of a string is the one the build read. The panel
   * asks before it offers, and says which it got.
   */
  readonly supportsDraftPreview: boolean;

  /** Whether this store can add and remove records at all — the panel asks before offering. */
  readonly supportsRecordChanges: boolean;

  /** Adds a record to one of the open sets. Returns the id it can be read back by. */
  createRecord(collectionId: string, record: NewCmsRecord): Promise<string>;

  /** Removes a record and everything hanging off it. */
  deleteRecord(collectionId: string, recordId: string): Promise<void>;

  /** Marks an enquiry read or archived. */
  setInquiryStatus(id: string, status: CmsInquiryStatus): Promise<void>;
}
