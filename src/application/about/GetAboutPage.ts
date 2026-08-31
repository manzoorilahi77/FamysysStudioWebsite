import type { AboutPage } from "../../domain/about/entities/AboutPage";
import type { AboutRepository } from "../../domain/about/repositories/AboutRepository";

export class GetAboutPage {
  constructor(private readonly repository: AboutRepository) {}

  async execute(): Promise<AboutPage> {
    return this.repository.getAboutPage();
  }
}
