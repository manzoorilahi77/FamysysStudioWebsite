import type { Cta } from "../../shared/value-objects/Cta";
import type { Url } from "../../shared/value-objects/Url";

/**
 * WHICH NETWORK an entry in the CONNECT column is, as a stable key rather than as its
 * label. The presentation layer picks the brand mark from this, so renaming "LinkedIn" to
 * "LinkedIn Page" in content changes the word and keeps the glyph; matching on the label
 * would have silently dropped the mark instead.
 */
export type SocialNetwork = "linkedin" | "instagram" | "youtube";

/**
 * One entry in the footer's CONNECT column.
 *
 * `href` is nullable because the column exists before every account does. A network with
 * a handle is a link that opens in a new tab; one without is a BUTTON that opens a small
 * "coming soon" dialog naming the network — not a dead anchor, and not a name that does
 * nothing when pressed. The dialog's copy is `FooterContent.socialPending`, so what it
 * says is content rather than a string in a component.
 */
export interface FooterSocialLink {
  readonly network: SocialNetwork;
  readonly label: string;
  readonly href: Url | null;
}

/**
 * What the footer says when something it names does not exist yet and is pressed anyway —
 * a social channel without an account, the capability deck before it is written. The
 * dialog prints the thing's own name as its heading, so the body does not have to; one
 * set of copy therefore serves every network, and a second set serves the deck.
 */
export interface PendingCopy {
  /** The small line above the name — "Coming soon", "In preparation". */
  readonly eyebrow: string;
  readonly body: string;
  readonly closeLabel: string;
}

/**
 * A DOCUMENT THE FOOTER OFFERS rather than a page it links to — today only the capability
 * deck, which famysys.com carries in the same position under its own wordmark.
 *
 * `href` is nullable for the same reason a social link's is, and behaves the same way: a
 * URL makes it a link that opens in a new tab, and null makes it a button that opens the
 * dialog below saying the document is being prepared. Supplying the file is one edit —
 * put its URL here — and nothing else about the footer changes.
 */
export interface FooterResource {
  readonly label: string;
  readonly href: Url | null;
  readonly pending: PendingCopy;
}

export interface FooterContent {
  /**
   * The brief's central-idea sentence. NO LONGER PRINTED IN THE FOOTER — the block under
   * the wordmark carries the postal address and the email now, at the client's direction.
   * It is still the source of the /contact panel's tagline (see contact.content.ts), so
   * the field stays rather than being deleted along with the footer's use of it.
   */
  readonly tagline: string;
  readonly contactEmail: string;
  /**
   * The Contact page, as the STUDIO column's third entry. The other five pages are read
   * from the navigation itself so the columns cannot drift from the menu; Contact is not
   * a navigation item — it is reached from the header's CTA — so it is named here.
   */
  readonly contactLink: Cta;
  /**
   * The postal address, one line per element, or null to print no address block at all.
   */
  readonly addressLines: ReadonlyArray<string> | null;
  readonly legalLinks: ReadonlyArray<Cta>;
  readonly socialLinks: ReadonlyArray<FooterSocialLink>;
  readonly socialPending: PendingCopy;
  /** The capability deck, beside the email on the footer's last line. */
  readonly capabilityDeck: FooterResource;
}
