import type { CmsInquiry } from "../../domain/cms/entities/CmsInquiry";
import type { CmsRepository } from "../../domain/cms/repositories/CmsRepository";

export class GetInquiries {
  constructor(private readonly repository: CmsRepository) {}

  async execute(): Promise<ReadonlyArray<CmsInquiry>> {
    return this.repository.getInquiries();
  }
}
