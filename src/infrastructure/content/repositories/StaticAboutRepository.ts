import type { AboutPage } from "../../../domain/about/entities/AboutPage";
import type { AboutRepository } from "../../../domain/about/repositories/AboutRepository";
import { aboutPage } from "../static/about.content";

export class StaticAboutRepository implements AboutRepository {
  async getAboutPage(): Promise<AboutPage> {
    return aboutPage;
  }
}
