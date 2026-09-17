import type { CapabilityDeckDocument } from "../../../domain/capability-deck/entities/CapabilityDeckDocument";
import type {
  CapabilityDeckRepository,
  ContentEdit,
  NewCmsRecord,
} from "../../../domain/capability-deck/repositories/CapabilityDeckRepository";
import type { CmsRecord } from "../../../domain/cms/entities/CmsRecord";
import type { ContentAddress, ContentFieldAddress } from "../../../domain/cms/entities/ContentAddress";

/** An in-memory stand-in, mirroring `application/cms/__fakes__/FakeCmsRepository.ts`'s shape. */
export class FakeCapabilityDeckRepository implements CapabilityDeckRepository {
  supportsDraftPreview = true;
  supportsRecordChanges = true;

  private drafts = new Map<string, string>();
  public publishCalls: ReadonlyArray<ContentAddress>[] = [];

  constructor(private document: CapabilityDeckDocument) {}

  async getDeck(): Promise<CapabilityDeckDocument> {
    return this.document;
  }

  async saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void> {
    for (const edit of edits) {
      this.drafts.set(`${edit.address.kind}:${edit.address.key}:${edit.address.field}`, edit.value);
    }
  }

  async publishDrafts(owners: ReadonlyArray<ContentAddress>): Promise<ReadonlyArray<ContentFieldAddress>> {
    this.publishCalls = [...this.publishCalls, owners];
    const written: ContentFieldAddress[] = [];
    for (const [key, value] of this.drafts) {
      const [kind, ownerKey, field] = key.split(":") as [ContentAddress["kind"], string, string];
      if (!owners.some((o) => o.kind === kind && o.key === ownerKey)) continue;
      written.push({ kind, key: ownerKey, field });
      this.drafts.delete(key);
      // Reflect the write onto the in-memory document so a second read sees it published.
      this.document = {
        ...this.document,
        slides: this.document.slides.map((slide) => applyPublish(slide, ownerKey, field, value)),
      };
    }
    return written;
  }

  async discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void> {
    for (const key of [...this.drafts.keys()]) {
      const [kind, ownerKey] = key.split(":");
      if (owners.some((o) => o.kind === kind && o.key === ownerKey)) this.drafts.delete(key);
    }
  }

  async addSlide(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async removeSlide(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async reorderSlides(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async createItem(_collectionId: string, _record: NewCmsRecord): Promise<string> {
    throw new Error("not used by this task's tests");
  }
  async deleteItem(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async reorderItems(): Promise<void> {
    throw new Error("not used by this task's tests");
  }
  async logActivity(): Promise<void> {}
}

function applyPublish(record: CmsRecord, ownerKey: string, field: string, value: string): CmsRecord {
  if (record.id === ownerKey || (record.address && record.address.key === ownerKey)) {
    return {
      ...record,
      groups: record.groups.map((g) => ({
        ...g,
        values: g.values.map((v) => (v.id === field ? { ...v, value } : v)),
      })),
    };
  }
  return { ...record, items: record.items.map((g) => ({ ...g, records: g.records.map((r) => applyPublish(r, ownerKey, field, value)) })) };
}
