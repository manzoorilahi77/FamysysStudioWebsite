import type { ClosingCtaBlock } from "../../marketing/entities/ClosingCtaBlock";
import type { Cta } from "../../shared/value-objects/Cta";
import type { MediaRef } from "../../shared/value-objects/MediaRef";

/**
 * The page's opening. One image, alongside the heading rather than behind it: a hero that
 * was pure text on a flat ground read as a placeholder, and a photograph behind the type
 * would have needed a wash the contrast rules cannot guarantee for the first 900ms.
 */
export interface AboutHero {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly media: MediaRef;
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
 * One claim about how the studio works, paired with what it means in practice. The
 * `claim` is the position; `practice` is the observable consequence a client could hold
 * the studio to. A claim without the second half is a slogan.
 */
export interface ApproachClaim {
  readonly title: string;
  readonly claim: string;
  readonly practice: string;
  readonly media: MediaRef;
}

/**
 * What the studio does and why, as three claims. The `intro` is the client's own sentence
 * naming the three inputs; the claims below it say what combining them actually changes.
 */
export interface ApproachBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly intro: string;
  /** Label above each claim's `practice`, e.g. "In practice". */
  readonly practiceLabel: string;
  readonly claims: ReadonlyArray<ApproachClaim>;
}

/**
 * One of the three inputs — human creativity, AI, structured production — stated as what
 * it contributes AND where it stops. The second half is the honest one: a page that only
 * lists what each input gives is a page that claims AI does everything.
 */
export interface InputPanel {
  readonly name: string;
  readonly contributes: string;
  readonly stops: string;
  /** Label above `contributes`, e.g. "Brings". Content, not chrome, so it lives here. */
  readonly contributesLabel: string;
  /** Label above `stops`, e.g. "Stops at". */
  readonly stopsLabel: string;
}

export interface InputsBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly inputs: ReadonlyArray<InputPanel>;
}

/**
 * One stage of how the studio is being built. `status` is the studio's own word for where
 * that stage stands — "Now", "Next", "After that" — and is rendered, because the point of
 * the section is to say plainly what is and is not ready yet.
 */
export interface BuildStage {
  readonly title: string;
  readonly status: string;
  readonly body: string;
}

/**
 * What "starting deliberately" means in practice: the order things are being built in.
 * `caveat` is the sentence that says what a client should not expect yet. It is a
 * separate field so it cannot be quietly dropped from the list above it.
 */
export interface BuildingBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly stages: ReadonlyArray<BuildStage>;
  readonly caveat: string;
}

/**
 * The relationship to the parent, stated plainly.
 *
 * Deliberately short. The point is to establish that the studio is not a standalone
 * start-up with no backing, and to stop there — claiming the parent's work as the
 * studio's own would be exactly the kind of borrowed credibility the rest of this page
 * is written to avoid. The image is of production, not of premises: there is no office
 * to photograph and none is implied.
 */
export interface EcosystemBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly paragraphs: ReadonlyArray<string>;
  readonly media: MediaRef;
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
 * The two labels name the two halves so the pairing is visible, not inferred.
 */
export interface DirectionBlock {
  readonly eyebrow: string;
  readonly heading: string;
  readonly ambitionLabel: string;
  readonly ambition: string;
  readonly presentLabel: string;
  readonly present: string;
  readonly media: MediaRef;
}

export interface AboutPage {
  readonly hero: AboutHero;
  readonly belief: BeliefBlock;
  readonly approach: ApproachBlock;
  readonly inputs: InputsBlock;
  readonly building: BuildingBlock;
  readonly ecosystem: EcosystemBlock;
  readonly direction: DirectionBlock;
  readonly closingCta: ClosingCtaBlock;
}
