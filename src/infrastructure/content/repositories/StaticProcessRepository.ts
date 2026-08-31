import type { HowWeWorkPage } from "../../../domain/process/entities/HowWeWorkPage";
import type { ProcessRepository } from "../../../domain/process/repositories/ProcessRepository";
import { howWeWorkPage } from "../static/how-we-work.content";

export class StaticProcessRepository implements ProcessRepository {
  async getHowWeWorkPage(): Promise<HowWeWorkPage> {
    return howWeWorkPage;
  }
}
