import type { ClosingCtaBlock } from "../../marketing/entities/ClosingCtaBlock";
import type { Cta } from "../../shared/value-objects/Cta";
import type { MediaRef } from "../../shared/value-objects/MediaRef";

export interface AboutHero {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
}

/**
 * The page's thesis, and the only thing on it that is centred.
 *
 * `statement` is the client's own central sentence, read from `aboutBlock` rather than
 * retyped. It stands alone at display size with the statement measure of space around
 * it — the same treatment the homepage gives its own thesis line, and the site's third
 * and last centred moment. Everything else on this page, and on every other page, is
 * flush left; that is what makes this one land rather than read as a habit.
 */
export interface BeliefBlock {
  /**
   * Accessible name for the section. NOT rendered: the statement stands completely
   * alone, with no eyebrow and nothing else beside it, exactly as the homepage's thesis
   * does. An eyebrow centred above it would be a second centred element and would spend
   * the whole emphasis budget at once.
   */
  readonly label: string;
  readonly statement: string;
}

/**
 * What the studio does and why. One image, because the section describes work rather
 * than the studio's own premises or people — of which there is nothing real to show.
 */
export interface ApproachBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly paragraphs: ReadonlyArray<string>;
  readonly media: MediaRef;
}

/**
 * The relationship to the parent, stated plainly.
 *
 * Deliberately short. The point is to establish that the studio is not a standalone
 * start-up with no backing, and to stop there — claiming the parent's work as the
 * studio's own would be exactly the kind of borrowed credibility the rest of this page
 * is written to avoid.
 */
export interface EcosystemBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly paragraphs: ReadonlyArray<string>;
  /** External. Rendered with target="_blank", rel="noopener noreferrer", and a visible
   *  and announced indication that it leaves the site. */
  readonly link: Cta;
}

/**
 * Ambition and current position in one block, in that order and never separated.
 *
 * The brief states both: what the studio intends to become, and that it is starting
 * deliberately. Rendering the first without the second would turn a plan into a claim
 * about the present, which is the single easiest way for this page to become false.
 */
export interface DirectionBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly ambition: string;
  readonly present: string;
}

export interface AboutPage {
  readonly hero: AboutHero;
  readonly belief: BeliefBlock;
  readonly approach: ApproachBlock;
  readonly ecosystem: EcosystemBlock;
  readonly direction: DirectionBlock;
  readonly closingCta: ClosingCtaBlock;
}
