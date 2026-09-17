// src/domain/capability-deck/entities/CapabilityDeckDocument.ts
import type { CmsRecord } from "../../cms/entities/CmsRecord";
import type { DeckSlideCatalogEntry } from "./DeckSlideCatalog";

/**
 * THE WHOLE DECK, AS THE PANEL SEES IT — the parallel to `CmsPage`, but for the one screen
 * that is not a fixed page.
 *
 * `slides` is ordered and IS the deck: what is in it, and in what order, is exactly what
 * renders at /capability-deck. `availableSlides` is the rest of `DECK_SLIDE_CATALOG` — the
 * slide types that exist in code but are not currently placed, and so are what "Add a
 * slide" offers a choice from.
 */
export interface CapabilityDeckDocument {
  readonly slides: ReadonlyArray<CmsRecord>;
  readonly availableSlides: ReadonlyArray<DeckSlideCatalogEntry>;
  readonly updatedAt: Date | null;
}
