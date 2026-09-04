import type { CmsCollection } from "../../../domain/cms/entities/CmsCollection";
import type { CmsInquiry } from "../../../domain/cms/entities/CmsInquiry";
import type { CmsMediaAsset } from "../../../domain/cms/entities/CmsMediaAsset";
import type { CmsPage } from "../../../domain/cms/entities/CmsPage";
import type { CmsValue } from "../../../domain/cms/entities/CmsRecord";
import type {
  ContentEdit,
  CmsRepository,
  NewCmsRecord,
} from "../../../domain/cms/repositories/CmsRepository";

/** A value with the annotations already applied, so a test can state only what it cares about. */
export function fakeValue(overrides: Partial<CmsValue> & Pick<CmsValue, "id" | "value">): CmsValue {
  return {
    label: overrides.label ?? overrides.id,
    kind: "text",
    approval: "drafted",
    usedElsewhere: [],
    pointer: { file: "marketing.content.ts", symbol: "heroContent", path: [overrides.id] },
    ...overrides,
  };
}

/**
 * Records what it was asked to write instead of writing it, which is the whole point:
 * `SaveCmsRecord`'s contract is that a rejected field leaves NOTHING written, and that is
 * only observable by watching this.
 */
export class FakeCmsRepository implements CmsRepository {
  readonly written: ContentEdit[][] = [];
  failWith: Error | null = null;

  constructor(
    private readonly pages: ReadonlyArray<CmsPage> = [],
    private readonly collections: ReadonlyArray<CmsCollection> = [],
  ) {}

  async getPages(): Promise<ReadonlyArray<CmsPage>> {
    return this.pages;
  }

  async getCollections(): Promise<ReadonlyArray<CmsCollection>> {
    return this.collections;
  }

  async getMediaLibrary(): Promise<ReadonlyArray<CmsMediaAsset>> {
    return [];
  }

  async getInquiries(): Promise<ReadonlyArray<CmsInquiry>> {
    return [];
  }

  async applyEdits(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    if (this.failWith) {
      throw this.failWith;
    }
    this.written.push([...edits]);
  }

  // The record half of the interface. The fake accepts both so a use-case test can assert
  // what it asked for without a database, and refuses when told to, so the refusal path
  // is testable too.
  readonly created: Array<{ collectionId: string; record: NewCmsRecord }> = [];
  readonly deleted: Array<{ collectionId: string; recordId: string }> = [];
  readonly statuses: Array<{ id: string; status: string }> = [];
  supportsRecordChanges = true;

  async createRecord(collectionId: string, record: NewCmsRecord): Promise<string> {
    if (this.failWith) throw this.failWith;
    this.created.push({ collectionId, record });
    return record.slug;
  }

  async deleteRecord(collectionId: string, recordId: string): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.deleted.push({ collectionId, recordId });
  }

  async setInquiryStatus(id: string, status: "new" | "read" | "archived"): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.statuses.push({ id, status });
  }
}
