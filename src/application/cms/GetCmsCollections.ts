import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";

export class GetCmsCollections {
  constructor(private readonly repository: CmsRepository) {}

  async execute(): Promise<ReadonlyArray<CmsCollection>> {
    return this.repository.getCollections();
  }
}
