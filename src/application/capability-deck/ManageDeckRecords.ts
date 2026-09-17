// src/application/capability-deck/ManageDeckRecords.ts
import { DECK_SLIDE_CATALOG } from "../../domain/capability-deck/entities/DeckSlideCatalog";
import type { CapabilityDeckRepository, NewCmsRecord } from "../../domain/capability-deck/repositories/CapabilityDeckRepository";

export type ChangeResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly message: string };

function failure(message: string): ChangeResult {
  return { ok: false, message };
}

const NO_STORE = "This cannot change while the site reads its content from the TypeScript files. Set CONTENT_SOURCE=database.";

/** Brings a known slide type into the deck, after `afterSlideId` (or first, when null). */
export class AddDeckSlide {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(slideKey: string, afterSlideId: string | null): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    if (!DECK_SLIDE_CATALOG.some((entry) => entry.slideKey === slideKey)) {
      return failure(`"${slideKey}" is not a known slide type.`);
    }
    const deck = await this.repository.getDeck();
    if (deck.slides.some((s) => s.id === slideKey)) {
      return failure("That slide is already in the deck.");
    }
    if (afterSlideId && !deck.slides.some((s) => s.id === afterSlideId)) {
      return failure("That is not a valid position to insert after. Reload the panel.");
    }
    try {
      await this.repository.addSlide(slideKey, afterSlideId);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The slide could not be added.");
    }
  }
}

export class RemoveDeckSlide {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(slideId: string): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const deck = await this.repository.getDeck();
    if (!deck.slides.some((s) => s.id === slideId)) {
      return failure("That slide is no longer in the deck. Reload the panel.");
    }
    try {
      await this.repository.removeSlide(slideId);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The slide could not be removed.");
    }
  }
}

/** `orderedSlideIds` must be exactly the current slide set, reordered — never a subset or a superset. */
export class ReorderDeckSlides {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(orderedSlideIds: ReadonlyArray<string>): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const deck = await this.repository.getDeck();
    const current = new Set(deck.slides.map((s) => s.id));
    const proposed = new Set(orderedSlideIds);
    const sameSet = current.size === proposed.size && [...current].every((id) => proposed.has(id));
    if (!sameSet) {
      return failure("That is not a reordering of the deck's current slides. Reload the panel and try again.");
    }
    try {
      await this.repository.reorderSlides(orderedSlideIds);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The slides could not be reordered.");
    }
  }
}

async function itemGroup(repository: CapabilityDeckRepository, collectionId: string) {
  const deck = await repository.getDeck();
  for (const slide of deck.slides) {
    const found = slide.items.find((g) => g.collectionId === collectionId);
    if (found) return found;
  }
  return undefined;
}

export class CreateDeckItem {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(collectionId: string, record: NewCmsRecord): Promise<ChangeResult & { readonly recordId?: string }> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const title = record.title.trim();
    if (!title) return failure("A new entry needs a title.");
    const summary = record.summary.trim();
    if (!summary) return failure("A new entry needs the one line that appears under its title.");

    const group = await itemGroup(this.repository, collectionId);
    if (!group || group.canChange === false) {
      return failure("Entries cannot be added to this part of the deck.");
    }
    try {
      const recordId = await this.repository.createItem(collectionId, { slug: record.slug.trim() || title, title, summary });
      return { ok: true, recordId };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The entry could not be added.");
    }
  }
}

export class DeleteDeckItem {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(collectionId: string, itemId: string): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const group = await itemGroup(this.repository, collectionId);
    if (!group || group.canChange === false || !group.records.some((r) => r.id === itemId)) {
      return failure("That entry is no longer there. Reload the panel.");
    }
    try {
      await this.repository.deleteItem(collectionId, itemId);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The entry could not be removed.");
    }
  }
}

export class ReorderDeckItems {
  constructor(private readonly repository: CapabilityDeckRepository) {}

  async execute(collectionId: string, orderedItemIds: ReadonlyArray<string>): Promise<ChangeResult> {
    if (!this.repository.supportsRecordChanges) return failure(NO_STORE);
    const group = await itemGroup(this.repository, collectionId);
    if (!group) return failure("That part of the deck is no longer there. Reload the panel.");
    const current = new Set(group.records.map((r) => r.id));
    const proposed = new Set(orderedItemIds);
    const sameSet = current.size === proposed.size && [...current].every((id) => proposed.has(id));
    if (!sameSet) {
      return failure("That is not a reordering of this collection's current entries. Reload the panel and try again.");
    }
    try {
      await this.repository.reorderItems(collectionId, orderedItemIds);
      return { ok: true };
    } catch (error: unknown) {
      return failure(error instanceof Error ? error.message : "The entries could not be reordered.");
    }
  }
}
