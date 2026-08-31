import type { HowWeWorkPage } from "../../domain/process/entities/HowWeWorkPage";
import type { ProcessRepository } from "../../domain/process/repositories/ProcessRepository";

export class GetHowWeWorkPage {
  constructor(private readonly repository: ProcessRepository) {}

  async execute(): Promise<HowWeWorkPage> {
    return this.repository.getHowWeWorkPage();
  }
}
