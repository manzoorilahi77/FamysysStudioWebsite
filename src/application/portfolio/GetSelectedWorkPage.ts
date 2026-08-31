import type { SelectedWorkPage } from "../../domain/portfolio/entities/SelectedWorkPage";
import type { PortfolioRepository } from "../../domain/portfolio/repositories/PortfolioRepository";

export class GetSelectedWorkPage {
  constructor(private readonly repository: PortfolioRepository) {}

  async execute(): Promise<SelectedWorkPage> {
    return this.repository.getSelectedWorkPage();
  }
}
