import type { Cta } from "../../shared/value-objects/Cta";
import type { Url } from "../../shared/value-objects/Url";

/**
 * One entry in the footer's CONNECT column.
 *
 * `href` is nullable because the column exists before the handles do. The Studio's
 * accounts are not supplied anywhere in the brief, and the one thing that must NOT happen
 * is the parent company's accounts being linked from the Studio's footer — a reader who
 * clicks "LinkedIn" here would land on famysys.com's engineering profile. So the column
 * renders with its three names and no destination until the client supplies them, and is
 * listed in docs/content-todo.md.
 */
export interface FooterSocialLink {
  readonly label: string;
  readonly href: Url | null;
}

export interface FooterContent {
  readonly tagline: string;
  readonly contactEmail: string;
  /**
   * The Contact page, as the EXPLORE column's sixth entry. The other five are read from
   * the navigation itself so the column cannot drift from the menu; Contact is not a
   * navigation item — it is reached from the header's CTA — so it is named here.
   */
  readonly contactLink: Cta;
  /**
   * The postal address, one line per element, or null while there is no confirmed address
   * to print. Null renders NOTHING rather than a fallback: the parent's Richmond, TX
   * address is the parent's, and a studio that does not sit at that desk printing it is a
   * factual error on every page of the site.
   */
  readonly addressLines: ReadonlyArray<string> | null;
  /**
   * The line under the copyright — the Studio's equivalent of the parent's "AI-Native
   * Digital Engineering Partner". Draft copy, pending client approval.
   */
  readonly descriptor: string;
  readonly legalLinks: ReadonlyArray<Cta>;
  readonly socialLinks: ReadonlyArray<FooterSocialLink>;
}
