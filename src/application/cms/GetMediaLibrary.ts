import type { CmsMediaAsset } from "../../domain/cms/entities/CmsMediaAsset";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";

export class GetMediaLibrary {
  constructor(private readonly repository: CmsRepository) {}

  async execute(): Promise<ReadonlyArray<CmsMediaAsset>> {
    return this.repository.getMediaLibrary();
  }
}
