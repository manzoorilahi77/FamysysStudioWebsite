import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";

/**
 * Returns `null` for an unknown id rather than throwing, because the only caller is a
 * route that answers a bad id with a 404 — an exception would have to be caught there and
 * turned back into the same thing.
 */
export class GetCmsPage {
  constructor(private readonly repository: CmsRepository) {}

  async execute(id: string): Promise<CmsPage | null> {
    const pages = await this.repository.getPages();
    return pages.find((page) => page.id === id) ?? null;
  }
}
