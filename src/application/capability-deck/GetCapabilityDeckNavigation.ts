// src/application/capability-deck/GetCapabilityDeckNavigation.ts
import type { CmsStatus } from "../../domain/cms/entities/CmsRecord";
import type { CapabilityDeckRepository } from "../../domain/capability-deck/repositories/CapabilityDeckRepository";
import type { DeckSlideCatalogEntry } from "../../domain/capability-deck/entities/DeckSlideCatalog";

export interface DeckNavSlide {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly status: CmsStatus;
}

export interface CapabilityDeckNavigation {
  readonly href: string;
  readonly slides: ReadonlyArray<DeckNavSlide>;
  readonly availableSlides: ReadonlyArray<DeckSlideCatalogEntry>;
  readonly status: CmsStatus;
}

export class GetCapabilityDeckNavigation {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(): Promise<CapabilityDeckNavigation> {
    const deck = await this.repository.getDeck();
    const slides = deck.slides.map((slide): DeckNavSlide => ({
      id: slide.id,
      label: slide.title,
      href: `/admin/capability-deck/${slide.id}`,
      status: slide.status,
    }));
    return {
      href: "/admin/capability-deck",
      slides,
      availableSlides: deck.availableSlides,
      status: slides.some((s) => s.status === "draft") ? "draft" : "published",
    };
  }
}
