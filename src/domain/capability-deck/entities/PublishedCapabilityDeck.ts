// src/domain/capability-deck/entities/PublishedCapabilityDeck.ts
import type { CapabilityDeckSource } from "./CapabilityDeckSource";

/**
 * THE PUBLIC ROUTE'S OWN READ MODEL — what `getCapabilityDeckContent.ts` produces and every
 * slide component ultimately renders. `enabledSlideKeys` is which slides exist and in what
 * order right now; `source` is every slide's plain content, in the same shape both the static
 * files and the database reader agree on. Kept in domain/ alongside `CapabilityDeckSource` for
 * the same reason — see that file's own note.
 */
export interface PublishedCapabilityDeck {
  readonly enabledSlideKeys: ReadonlyArray<string>;
  readonly source: CapabilityDeckSource;
}
