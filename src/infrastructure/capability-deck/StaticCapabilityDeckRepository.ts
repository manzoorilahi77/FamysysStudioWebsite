import { DECK_SLIDE_CATALOG } from "../../domain/capability-deck/entities/DeckSlideCatalog";
import type { CapabilityDeckDocument } from "../../domain/capability-deck/entities/CapabilityDeckDocument";
import type { CapabilityDeckRepository, ContentEdit, NewCmsRecord } from "../../domain/capability-deck/repositories/CapabilityDeckRepository";
import type { ContentAddress, ContentFieldAddress } from "../../domain/cms/entities/ContentAddress";
import * as content from "../../presentation/capability-deck/data/content";
import { buildDeckSlideRecords } from "./deckRecords";
import type { CapabilityDeckSource } from "./deckRecords";

const NO_STORE =
  "The Capability Deck cannot be edited while the site reads its content from the TypeScript " +
  "files: there is nowhere to hold a draft, a version, or a slide's position. Set CONTENT_SOURCE=database.";

/** The exact object every method below reads content.ts's exports into — see deckRecords.ts. */
export function staticDeckSource(): CapabilityDeckSource {
  return {
    cover: content.coverContent,
    whoWeAre: content.whoWeAre,
    processSteps: content.processSteps,
    serviceCategories: content.serviceCategories,
    engagementModels: content.engagementModels,
    portfolioCategories: content.portfolioCategories,
    cta: content.ctaContent,
  };
}

/**
 * THE FILE-BACKED FALLBACK — read-only in the same sense the seven pages' file-backed
 * store is read-only for structural changes. Every slide is always present, in catalog
 * order, because there is no `deck_slides` table here to say otherwise: the TypeScript
 * files have exactly the slides CapabilityDeck.tsx's own array names, always all of them.
 *
 * Reused by `scripts/db-seed.ts`, which is the ONE caller that needs this class's read
 * side and never its writes — see Task 8.
 */
export class StaticCapabilityDeckRepository implements CapabilityDeckRepository {
  readonly supportsDraftPreview = false;
  readonly supportsRecordChanges = false;

  async getDeck(): Promise<CapabilityDeckDocument> {
    const records = buildDeckSlideRecords(staticDeckSource(), null);
    return {
      slides: DECK_SLIDE_CATALOG.map((entry) => records.get(entry.slideKey)).filter(
        (record): record is NonNullable<typeof record> => record !== undefined,
      ),
      availableSlides: [],
      updatedAt: null,
    };
  }

  async saveDrafts(_edits: ReadonlyArray<ContentEdit>): Promise<void> {
    throw new Error(NO_STORE);
  }
  async publishDrafts(_owners: ReadonlyArray<ContentAddress>): Promise<ReadonlyArray<ContentFieldAddress>> {
    throw new Error(NO_STORE);
  }
  async discardDrafts(_owners: ReadonlyArray<ContentAddress>): Promise<void> {
    throw new Error(NO_STORE);
  }
  async addSlide(_slideKey: string, _afterSlideId: string | null): Promise<void> {
    throw new Error(NO_STORE);
  }
  async removeSlide(_slideId: string): Promise<void> {
    throw new Error(NO_STORE);
  }
  async reorderSlides(_orderedSlideIds: ReadonlyArray<string>): Promise<void> {
    throw new Error(NO_STORE);
  }
  async createItem(_collectionId: string, _record: NewCmsRecord): Promise<string> {
    throw new Error(NO_STORE);
  }
  async deleteItem(_collectionId: string, _itemId: string): Promise<void> {
    throw new Error(NO_STORE);
  }
  async reorderItems(_collectionId: string, _orderedItemIds: ReadonlyArray<string>): Promise<void> {
    throw new Error(NO_STORE);
  }
  async logActivity(_entry?: { readonly action: "saved" | "published" | "previewed"; readonly sectionLabel?: string }): Promise<void> {
    // No store to log against — a no-op, the same shape StaticCmsRepository's own
    // activity log takes (see its `supportsActivityLog = false`).
  }
}
