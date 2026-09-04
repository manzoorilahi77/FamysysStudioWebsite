import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";

/** `null` for an unknown id — see `GetCmsPage` for why. */
export class GetCmsCollection {
  constructor(private readonly repository: CmsRepository) {}

  async execute(id: string): Promise<CmsCollection | null> {
    const collections = await this.repository.getCollections();
    return collections.find((collection) => collection.id === id) ?? null;
  }
}
