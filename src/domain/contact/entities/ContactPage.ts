/**
 * The last page on the site, and the only one whose reference is famysys.com's own
 * contact page rather than the design language the other six share.
 */

export interface ContactHero {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
}

/** The eight labels, in the order the form asks them. */
export interface ContactFormLabels {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly companyName: string;
  readonly companyWebsite: string;
  readonly role: string;
  readonly companySize: string;
  readonly brief: string;
}

export interface ContactFormBlock {
  readonly heading: string;
  readonly labels: ContactFormLabels;
  /** Appended to the one field that is not required, so the ask is visible before the error. */
  readonly optionalSuffix: string;
  /** Shown in both selects until the sender chooses. Never a valid submission. */
  readonly selectPlaceholder: string;
  readonly submitLabel: string;
  readonly submittingLabel: string;
  readonly confirmationHeading: string;
  readonly confirmationBody: string;
  /** Shown when the request itself fails — a network error, not a field the sender can fix. */
  readonly submitErrorMessage: string;
}

export interface NextStep {
  /** "01", "02", "03" — rendered, so it is content rather than an index. */
  readonly numeral: string;
  readonly heading: string;
  readonly body: string;
}

/**
 * DELIBERATELY EMPTY UNTIL THE CLIENT SUPPLIES THEM.
 *
 * famysys.com publishes hello@famysys.com and a phone number. Both are the PARENT's, and
 * the Studio may share them or may have its own — the brief says nothing either way, and
 * publishing a number that rings the wrong desk is worse than publishing none. Both
 * fields are optional here so the panel can render without them, and the block that would
 * hold them is not rendered at all while they are absent. See docs/content-todo.md.
 */
export interface DirectContact {
  readonly email?: string;
  readonly phone?: string;
}

export interface NextStepsPanel {
  readonly heading: string;
  readonly steps: ReadonlyArray<NextStep>;
  readonly directEyebrow: string;
  /** The studio's own line, under the wordmark, as on the parent's panel. */
  readonly tagline: string;
  readonly direct: DirectContact;
  /**
   * The brief's own closing line. The last thing on the page before the footer, which is
   * what a closing line is for.
   */
  readonly closingLine: string;
}

/**
 * NO TRUST BADGES, and this is not an oversight.
 *
 * The parent's panel carries "SOC2 Type II Compliant", "Strict Commercial NDA" and a
 * "Zero Lock-In Guarantee". The first is a certification an auditor issues to a named
 * entity; the other two are contractual commitments. The Studio is a new arm of the
 * business and there is nothing in the brief saying it holds any of them. Reproducing
 * them here would be claiming a certification the business may not have, which is a
 * different kind of problem from unapproved copy. The space is left empty until the
 * manager says what the Studio can genuinely claim — see docs/content-todo.md.
 *
 * NO QR BUSINESS CARD either. The parent's is a personal digital card and probably
 * belongs to an individual; whose it would be here is a question for the client, not
 * something to reproduce.
 */
export interface ContactPage {
  readonly hero: ContactHero;
  readonly form: ContactFormBlock;
  readonly panel: NextStepsPanel;
}
