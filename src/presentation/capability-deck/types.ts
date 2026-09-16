/**
 * The shapes his JavaScript passed around implicitly.
 *
 * Nothing here adds behaviour or changes a call site — these are the props
 * PresentationShell already handed to every slide, and the content shapes
 * data/content.ts already produced, written down so the port type-checks under
 * this project's `strict` + `noUncheckedIndexedAccess` +
 * `exactOptionalPropertyTypes` settings.
 */

import type { ReactElement } from "react";

// ---------------------------------------------------------------------------
// Slides
// ---------------------------------------------------------------------------

/** The "04 / 06 — SELECTED WORK" index a slide prints through SectionLabel. */
export interface SlideMeta {
  readonly index: number;
  readonly total: number;
  readonly title: string;
}

/**
 * Every slide receives all four. Most read only `meta`; Selected Work is the one
 * that uses the tab pair, because its category tabs are stepped by the same
 * next/prev that moves between slides and so are owned by the shell.
 */
export interface SlideProps {
  readonly meta: SlideMeta;
  readonly active: boolean;
  readonly activeTab: number;
  readonly onActiveTabChange: (index: number) => void;
}

/**
 * A slide is allowed to declare fewer parameters than it is given — CoverSlide
 * takes none — which is why this is a call signature rather than
 * `FC<SlideProps>`.
 */
export type SlideComponent = (props: SlideProps) => ReactElement;

export interface SlideEntry {
  readonly id: string;
  readonly title: string;
  readonly Component: SlideComponent;
}

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/** One boundary's transition preset. See components/motion.ts. */
export interface TransitionPreset {
  readonly key: string;
  readonly axis: "x" | "y" | "xy";
  readonly distance: number;
  readonly scale: number;
  readonly mask: MaskDirection;
  readonly duration: number;
}

export type MaskDirection = "left" | "right" | "top" | "bottom" | "center";

/**
 * 1 travelling forward through the deck, -1 travelling back, 0 before the first
 * navigation. Consumers test `direction >= 0`, so 0 and 1 behave alike.
 */
export type Direction = 1 | 0 | -1;

// ---------------------------------------------------------------------------
// content.ts
//
// ONE WIDE SHAPE RATHER THAN A DISCRIMINATED UNION, deliberately. The seven
// portfolio categories genuinely differ — four carry `videos`, print carries
// `subcategories`, websites carries `projects`, presentation carries `embedUrl`
// — and a union would be the more precise description of the data. But his
// SelectedWorkSlide reads them through runtime guards (`Array.isArray(
// current.projects)`, `Boolean(current.embedUrl)`) rather than through a
// discriminant, and a union would force that code to be restructured around
// narrowing. The brief was fidelity, so the type describes how the data is
// READ: optional fields, absent where they do not apply, exactly as his
// JavaScript saw them.
// ---------------------------------------------------------------------------

export type MediaRatio = "portrait" | "landscape" | "square";

export interface DeckVideo {
  readonly title: string;
  readonly src: string;
  readonly ratio?: MediaRatio;
}

/** One plate in a print subcategory's image gallery. */
export interface DeckImage {
  readonly key?: string;
  readonly title?: string;
  readonly summary?: string;
  readonly bullets?: ReadonlyArray<string>;
  readonly url?: string;
  readonly image?: string;
  readonly src?: string;
  readonly ratio?: MediaRatio;
}

/** Banners / Posters / Product Posters, under Digital Print & Design. */
export interface DeckSubcategory {
  readonly key: string;
  readonly label: string;
  readonly ratio?: MediaRatio;
  readonly images?: ReadonlyArray<DeckImage>;
  readonly videos?: ReadonlyArray<DeckVideo>;
}

/** One entry in the Websites coverflow. */
export interface DeckProject {
  readonly key: string;
  readonly title: string;
  readonly category: string;
  readonly summary: string;
  readonly bullets: ReadonlyArray<string>;
  readonly url: string;
  /** The site is framed live when it allows framing; otherwise a screenshot. */
  readonly previewUrl?: string;
  /** Set where the site refuses to be framed — the card opens it instead. */
  readonly liveUrl?: string;
  readonly image?: string;
  readonly ratio?: MediaRatio;
}

/** What the slide prints above the gallery: what you send, what comes back. */
export interface DeckProcess {
  readonly input: string;
  readonly output: string;
}

export interface PortfolioCategory {
  readonly key: string;
  readonly label: string;
  readonly ratio: MediaRatio;
  readonly copy?: string;
  readonly process?: DeckProcess;
  readonly videos?: ReadonlyArray<DeckVideo>;
  readonly subcategories?: ReadonlyArray<DeckSubcategory>;
  readonly projects?: ReadonlyArray<DeckProject>;
  // The Presentation category is a single embedded deck rather than a gallery.
  readonly title?: string;
  readonly category?: string;
  readonly summary?: string;
  readonly bullets?: ReadonlyArray<string>;
  readonly url?: string;
  readonly embedUrl?: string;
  /**
   * Never present in the content today, and deliberately so: with no media
   * the slide falls back to PortfolioMedia's typographic placeholder rather
   * than a fabricated screenshot. Typed because his slide reads it.
   */
  readonly media?: PortfolioMediaSource;
}

/**
 * The card shape both galleries render — his Websites entries and the rows
 * SelectedWorkSlide derives from print images share it.
 */
export interface GalleryProject {
  readonly key: string;
  readonly title: string;
  readonly category: string;
  /** Optional because the print rows derive it from the category's copy. */
  readonly summary?: string | undefined;
  readonly bullets: ReadonlyArray<string>;
  readonly url: string;
  readonly previewUrl?: string | undefined;
  readonly liveUrl?: string | undefined;
  readonly image?: string | null | undefined;
  readonly ratio?: MediaRatio | undefined;
}

// ---------------------------------------------------------------------------
// PortfolioMedia
// ---------------------------------------------------------------------------

export interface PortfolioMediaSource {
  readonly type: "image" | "video" | "embed";
  readonly src: string;
  readonly poster?: string;
}
