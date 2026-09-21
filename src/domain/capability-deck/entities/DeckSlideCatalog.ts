// src/domain/capability-deck/entities/DeckSlideCatalog.ts

/**
 * THE SEVEN SLIDE TYPES THAT EXIST IN CODE, AND THAT IS A DIFFERENT FACT FROM WHICH ONES
 * ARE CURRENTLY IN THE DECK.
 *
 * A slide is a bespoke React component (CoverSlide, WhoWeAreSlide, ...), not a generic
 * template — so "add a slide" cannot mean inventing an arbitrary new layout from a form the
 * way adding a capability card can. What it safely means, and what this catalog exists to
 * support, is: an editor may bring any of these seven known slide types into the deck, take
 * one out, and reorder the ones that are in. A slide type not in this list does not exist
 * yet and needs a developer to build its component first, exactly the way How We Work
 * already exists in code today but is not currently placed in the deck.
 *
 * `slideKey` matches `SlideEntry.id` in CapabilityDeck.tsx and is the `deck_slides.slide_key`
 * / `content_strings.owner_key` this whole feature addresses a slide by.
 */
export interface DeckSlideCatalogEntry {
  readonly slideKey: string;
  readonly label: string;
  /**
   * Whether a fresh deck (the seed, the file-backed fallback) places this slide. False means
   * the slide type exists in code and is offered by "Add a slide", but is not in the deck —
   * the state How We Work is in as of the six-slide deck (2026-09).
   */
  readonly inDefaultDeck: boolean;
}

export const DECK_SLIDE_CATALOG: ReadonlyArray<DeckSlideCatalogEntry> = [
  { slideKey: "cover", label: "Cover", inDefaultDeck: true },
  { slideKey: "who-we-are", label: "Who We Are", inDefaultDeck: true },
  { slideKey: "how-we-work", label: "How We Work", inDefaultDeck: false },
  { slideKey: "services", label: "Services", inDefaultDeck: true },
  { slideKey: "selected-work", label: "Selected Work", inDefaultDeck: true },
  { slideKey: "ways-to-work", label: "Ways to Work", inDefaultDeck: true },
  { slideKey: "lets-talk", label: "Let's Talk", inDefaultDeck: true },
];

export function catalogLabel(slideKey: string): string {
  return DECK_SLIDE_CATALOG.find((entry) => entry.slideKey === slideKey)?.label ?? slideKey;
}
