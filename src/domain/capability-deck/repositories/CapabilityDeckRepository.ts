// src/domain/capability-deck/repositories/CapabilityDeckRepository.ts
import type { ContentAddress, ContentFieldAddress } from "../../cms/entities/ContentAddress";
import type { ContentEdit, NewCmsRecord } from "../../cms/repositories/CmsRepository";
import type { CapabilityDeckDocument } from "../entities/CapabilityDeckDocument";

export { ContentConflictError } from "../../cms/repositories/CmsRepository";
export type { ContentEdit, NewCmsRecord };

/**
 * THE DECK'S OWN REPOSITORY — the parallel to `CmsRepository`, scoped to the one screen
 * that is not a fixed page.
 *
 * It shares `ContentEdit`/`ContentAddress`/`ContentFieldAddress`/`ContentConflictError`
 * with the seven pages' repository rather than declaring its own: a save, a publish, a
 * conflict and a version mean the same thing here as they do everywhere else in the panel,
 * and reusing the types is what keeps that true by construction.
 *
 * SLIDES AND ITEMS ARE BOTH "RECORDS THAT COME AND GO", but they are two different runs —
 * a slide is a top-level entry in `slides`; an item is a repeatable card inside one slide's
 * `CmsItemGroup` (a video, a website entry, a print image, a service, an engagement tier).
 * That is why there are two add/remove/reorder trios rather than one generic pair: a slide
 * add needs a slide TYPE (from `DECK_SLIDE_CATALOG`) and a position; an item add needs a
 * `collectionId` (which `CmsItemGroup` it belongs to) the same way `CmsRepository.createRecord`
 * already does for the seven pages' open collections.
 */
export interface CapabilityDeckRepository {
  getDeck(): Promise<CapabilityDeckDocument>;

  saveDrafts(edits: ReadonlyArray<ContentEdit>): Promise<void>;
  publishDrafts(owners: ReadonlyArray<ContentAddress>): Promise<ReadonlyArray<ContentFieldAddress>>;
  discardDrafts(owners: ReadonlyArray<ContentAddress>): Promise<void>;

  /** False for the static-file fallback — writing there would desync it from the database. */
  readonly supportsDraftPreview: boolean;
  readonly supportsRecordChanges: boolean;

  /** Brings a known-but-not-placed slide type into the deck, after `afterSlideId` (or first, if null). */
  addSlide(slideKey: string, afterSlideId: string | null): Promise<void>;
  /** Removes a slide from the deck. Its saved content is not deleted, only its placement. */
  removeSlide(slideId: string): Promise<void>;
  reorderSlides(orderedSlideIds: ReadonlyArray<string>): Promise<void>;

  createItem(collectionId: string, record: NewCmsRecord): Promise<string>;
  deleteItem(collectionId: string, itemId: string): Promise<void>;
  reorderItems(collectionId: string, orderedItemIds: ReadonlyArray<string>): Promise<void>;

  logActivity(entry: { readonly action: "saved" | "published" | "previewed"; readonly sectionLabel?: string }): Promise<void>;
}
