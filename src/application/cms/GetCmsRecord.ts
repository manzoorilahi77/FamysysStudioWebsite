import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import type { CmsRecord } from "../../domain/cms/entities/CmsRecord";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";

export interface CmsRecordInCollection {
  readonly collection: CmsCollection;
  readonly record: CmsRecord;
}

/**
 * A record detail view needs its collection too — for the breadcrumb, the back link and
 * the panel labels — so the two are returned together rather than making the route load
 * the collection a second time.
 */
export class GetCmsRecord {
  constructor(private readonly repository: CmsRepository) {}

  async execute(collectionId: string, recordId: string): Promise<CmsRecordInCollection | null> {
    const collections = await this.repository.getCollections();
    const collection = collections.find((candidate) => candidate.id === collectionId);
    if (!collection) {
      return null;
    }
    const record = collection.records.find((candidate) => candidate.id === recordId);
    if (!record) {
      return null;
    }
    return { collection, record };
  }
}
