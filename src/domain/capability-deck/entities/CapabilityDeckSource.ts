// src/domain/capability-deck/entities/CapabilityDeckSource.ts

/**
 * THE DECK'S OWN SOURCE SHAPE — the same plain objects `data/content.ts` already exports,
 * named here so both repositories (Task 6: static, Task 7: database) can produce one and
 * this file does not need to know which produced it.
 *
 * `portfolioCategories` keeps content.ts's own shape (see types.ts's `PortfolioCategory`)
 * rather than a deck-specific reshaping: the seven categories are structurally fixed (see
 * the design note above this task), so there is nothing to gain from inventing a second
 * shape for data that is read exactly once, here.
 *
 * Lives in domain/ rather than infrastructure/ (where it was first declared, in
 * infrastructure/capability-deck/deckRecords.ts) because it is a pure data shape with no
 * imports of its own — no `ContentStore`, no `MediaRef`, no React — and both the admin CMS
 * builder (deckRecords.ts) and the public route's slide components (presentation/capability-deck/)
 * need to reference it. `presentation/` may depend on `domain/` but not on `infrastructure/`
 * (see eslint.config.mjs's `boundaries/element-types` rule), so this is where a shape shared
 * across both sides of that boundary belongs.
 */
export interface CapabilityDeckSource {
  readonly cover: {
    readonly brand: string;
    readonly headlineLine1: string;
    readonly headlineAccent: string;
    readonly supporting: string;
    readonly decorativeLabel: string;
    readonly logoMark: string;
  };
  readonly whoWeAre: {
    readonly headline: string;
    readonly copy: string;
    readonly highlights: ReadonlyArray<{ readonly title: string; readonly copy: string }>;
    readonly established: string;
    readonly locations: string;
    readonly visionMission: ReadonlyArray<{ readonly title: string; readonly copy: string }>;
  };
  readonly processSteps: ReadonlyArray<{ readonly index: string; readonly title: string; readonly copy: string }>;
  readonly serviceCategories: ReadonlyArray<{
    readonly title: string;
    readonly tagline: string;
    readonly examples: ReadonlyArray<string>;
  }>;
  readonly engagementModels: ReadonlyArray<{
    readonly tag: string;
    readonly title: string;
    readonly audience: string;
    readonly examples: ReadonlyArray<string>;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- content.ts's own type, imported by the two repositories that populate this field
  readonly portfolioCategories: ReadonlyArray<any>;
  readonly cta: {
    readonly headline: string;
    readonly body: string;
    readonly ctaLabel: string;
    readonly ctaHref: string;
    readonly caption: string;
  };
}
