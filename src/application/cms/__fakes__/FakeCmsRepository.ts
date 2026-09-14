import type { CmsActivityAction, CmsActivityEntry } from "../../../domain/cms/entities/CmsActivityEntry";
import type { CmsInquiry, CmsInquiryStatus } from "../../../domain/cms/entities/CmsInquiry";
import type { CmsPage } from "../../../domain/cms/entities/CmsPage";
import type { CmsRecord, CmsValue } from "../../../domain/cms/entities/CmsRecord";
import type {
  ContentAddress,
  ContentFieldAddress,
} from "../../../domain/cms/entities/ContentAddress";
import { addressKey } from "../../../domain/cms/entities/ContentAddress";
import type {
  ContentEdit,
  CmsRepository,
  NewCmsRecord,
} from "../../../domain/cms/repositories/CmsRepository";

/**
 * A value with the annotations already applied, so a test can state only what it cares
 * about. Giving it a `readOnlyReason` drops the pointer, which is what makes a value
 * read-only in the model — the two always travel together, and a fake that let them come
 * apart would let a test pass against a state the real builders cannot produce.
 */
export function fakeValue(overrides: Partial<CmsValue> & Pick<CmsValue, "id" | "value">): CmsValue {
  const editable = overrides.readOnlyReason === undefined;
  return {
    label: overrides.label ?? overrides.id,
    kind: "text",
    multiline: false,
    approval: "drafted",
    usedElsewhere: [],
    ...(editable
      ? { pointer: { file: "marketing.content.ts", symbol: "heroContent", path: [overrides.id] } }
      : {}),
    ...overrides,
  };
}

/** A record with one group of plain values, which is the shape most tests need. */
export function fakeRecord(
  overrides: Partial<Omit<CmsRecord, "groups">> &
    Pick<CmsRecord, "id"> & { readonly values?: ReadonlyArray<CmsValue> },
): CmsRecord {
  const { values, ...rest } = overrides;
  return {
    title: overrides.title ?? overrides.id,
    summary: overrides.summary ?? "",
    status: "published",
    updatedAt: null,
    items: [],
    ...rest,
    groups: [{ id: "copy", label: "Copy", values: values ?? [], lists: [], media: [] }],
  };
}

export function fakePage(
  overrides: Partial<CmsPage> & Pick<CmsPage, "id" | "sections">,
): CmsPage {
  return {
    title: overrides.title ?? overrides.id,
    route: "/",
    description: "",
    source: "marketing.content.ts",
    sectionsAreDerived: true,
    updatedAt: null,
    ...overrides,
  };
}

/**
 * Records what it was asked to write instead of writing it, which is the whole point:
 * `SaveCmsSection`'s contract is that a rejected field leaves NOTHING written, and that is
 * only observable by watching this.
 *
 * Drafts are kept in memory and keyed the way both real stores key them, so a test can
 * assert that a publish moved exactly the fields a save put there.
 */
export class FakeCmsRepository implements CmsRepository {
  readonly written: ContentEdit[][] = [];
  readonly discarded: ContentAddress[][] = [];
  readonly drafts = new Map<string, ContentEdit>();
  failWith: Error | null = null;

  constructor(private readonly pages: ReadonlyArray<CmsPage> = []) {}

  async getPages(): Promise<ReadonlyArray<CmsPage>> {
    return this.pages;
  }

  async getInquiries(): Promise<ReadonlyArray<CmsInquiry>> {
    return this.inquiries;
  }

  inquiries: ReadonlyArray<CmsInquiry> = [];

  async saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.written.push([...edits]);
    for (const edit of edits) {
      this.drafts.set(`${addressKey(edit.address)}:${edit.address.field}`, edit);
    }
  }

  async publishDrafts(
    owners: ReadonlyArray<ContentAddress>,
  ): Promise<ReadonlyArray<ContentFieldAddress>> {
    if (this.failWith) throw this.failWith;
    const prefixes = owners.map((owner) => `${addressKey(owner)}:`);
    const moved = [...this.drafts.entries()].filter(([key]) =>
      prefixes.some((prefix) => key.startsWith(prefix)),
    );
    for (const [key] of moved) this.drafts.delete(key);
    return moved.map(([, edit]) => edit.address);
  }

  async discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.discarded.push([...owners]);
    const prefixes = owners.map((owner) => `${addressKey(owner)}:`);
    for (const key of [...this.drafts.keys()]) {
      if (prefixes.some((prefix) => key.startsWith(prefix))) this.drafts.delete(key);
    }
  }

  // The record half of the interface. The fake accepts both so a use-case test can assert
  // what it asked for without a database, and refuses when told to, so the refusal path
  // is testable too.
  readonly created: Array<{ collectionId: string; record: NewCmsRecord }> = [];
  readonly deleted: Array<{ collectionId: string; recordId: string }> = [];
  readonly statuses: Array<{ id: string; status: string }> = [];
  supportsRecordChanges = true;
  supportsDraftPreview = true;

  async createRecord(collectionId: string, record: NewCmsRecord): Promise<string> {
    if (this.failWith) throw this.failWith;
    this.created.push({ collectionId, record });
    return record.slug;
  }

  async deleteRecord(collectionId: string, recordId: string): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.deleted.push({ collectionId, recordId });
  }

  async setInquiryStatus(id: string, status: CmsInquiryStatus): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.statuses.push({ id, status });
  }

  readonly loggedActivity: Array<{
    action: CmsActivityAction;
    pageLabel: string;
    sectionLabel?: string;
  }> = [];
  supportsActivityLog = true;

  async logActivity(entry: {
    readonly action: CmsActivityAction;
    readonly pageLabel: string;
    readonly sectionLabel?: string;
  }): Promise<void> {
    this.loggedActivity.push({ ...entry });
  }

  async getRecentActivity(_limit: number): Promise<ReadonlyArray<CmsActivityEntry>> {
    return [];
  }
}
