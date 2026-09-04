import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";

export class GetCmsPages {
  constructor(private readonly repository: CmsRepository) {}

  async execute(): Promise<ReadonlyArray<CmsPage>> {
    return this.repository.getPages();
  }
}
