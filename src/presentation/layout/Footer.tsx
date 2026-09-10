import Link from "next/link";
import type { CtaView, FooterContentView, NavEntryView } from "../lib/viewModels";
import { shellStyle } from "../components/Container";
import { Wordmark } from "../components/Wordmark";
import { FooterSeam } from "./FooterSeam";
import { FooterConnect } from "./FooterConnect";
import { FooterDeck } from "./FooterDeck";

interface FooterProps {
  readonly entries: ReadonlyArray<NavEntryView>;
  readonly footer: FooterContentView;
}

/**
 * A column of links under a small tracked heading. Four of them, and they are `<nav>`
 * elements rather than `<div>`s: each is a named group of destinations, which is what
 * gives a screen reader "Services", "Studio", "Connect" and "Legal" as landmarks it can
 * jump between instead of one undifferentiated list of twelve links.
 */
function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      {/* FULL CANVAS, against the canvas-60 the links under it rest at. The heading and
          its list used to be the same value, distinguished only by being uppercase and
          tracked — which reads as a heading if you are looking for one and as a slightly
          odd first list item if you are not. The tonal step is what says "these four words
          name the groups; everything under them is a destination". */}
      <p className="label text-canvas">{title}</p>
      {/* 20px, not 14: each link's hit box is 44px on a 24px line (see `.footer-link`),
          and 20px is what lets the boxes meet without overlapping. The columns grow by
          12px; the identity column beside them is taller anyway, so the footer does not. */}
      <ul className="mt-6 flex flex-col gap-5">{children}</ul>
    </nav>
  );
}

function FooterLink({ cta }: { cta: CtaView }) {
  return (
    <li>
      <Link href={cta.href} className="footer-link text-small">
        {cta.label}
      </Link>
    </li>
  );
}

/**
 * THE SITE FOOTER, SHAPED AGAINST famysys.com's OWN.
 *
 * ONE BAND. It was two, split across the middle by a full-width hairline: the columns
 * above, and "Get in touch" with the email at display size below. That line drew the eye
 * straight to it and made the footer read as two stacked footers when everything in it is
 * one closing statement.
 *
 * It is one band of four areas now — see the note on `.footer-band` below. The wordmark
 * and address sit beside the four link columns, and under them runs the footer's LAST
 * LINE: the email and the capability deck at the left, the copyright at the right, on one
 * text baseline. The padding is 32px rather than the 80 it opened with.
 *
 * THE DESCRIPTOR LINE IS GONE. "AI-Enabled Creative Production Partner" sat under the
 * copyright as the Studio's answer to the parent's "AI-Native Digital Engineering
 * Partner". It was drafted copy that never got approved, it said nothing the six pages
 * above it had not already said better, and it was the reason the closing row existed.
 * Removed from the entity and the CMS too, not just from here — a field the panel offers
 * for a line that renders nowhere is worse than no field.
 *
 * WHAT THE IDENTITY BLOCK SAYS. The wordmark and the address, with the email directly
 * under the address and the capability deck beside the email — the email's line is the
 * one the copyright shares.
 *
 * THE TAGLINE IT USED TO SAY. It used to be the brief's central-idea sentence — a
 * tagline the reader had already met at the top of whichever page they were on, restated
 * at the bottom. It is the address and the email now, at the client's direction: by the
 * time someone has read to the foot of a page the useful thing is where the studio is and
 * how to reach it, not another description of what it does. The tagline still exists in
 * content and /contact still uses it; the footer just stopped repeating it.
 *
 * TWELVE DESTINATIONS, FOUR COLUMNS OF THREE. SERVICES is what the studio sells and how
 * buying it works; STUDIO is who is selling and the proof — the work, the company, the way
 * in; CONNECT is the three networks, one linked and two that open a "coming soon" dialog
 * until their accounts exist; LEGAL is the two documents and the questions page. Every
 * one of the twelve now goes somewhere.
 *
 * THE PAGE COLUMNS ARE DERIVED, NOT LISTED. Services and Studio read the navigation, from
 * the same source the header reads, so they cannot drift from the menu — and that includes
 * the pages the BAR does not name. How We Work is one: it is not a top-level bar item any
 * more, it is a block inside the Ways to Work With Us panel, and it is picked up here from
 * that block rather than retyped, so the footer lists all six content pages either way.
 *
 * Only Contact is named in content, because it is not a navigation item at all — the bar
 * used to reach it through a CTA button, which has been removed, and the drawer still
 * does.
 */
/**
 * Which side of the split a page falls on, BY ROUTE rather than by label. The labels come
 * from the CMS and the client can rewrite any of them; the routes are the site's own and
 * cannot be edited into the wrong column.
 *
 * A page not named here goes to SERVICES, which is the safer default: a new top-level page
 * is far more likely to be something the studio does than another way of describing the
 * studio itself. Add its route here when it is not.
 */
const STUDIO_HREFS: ReadonlySet<string> = new Set(["/selected-work", "/about", "/contact"]);

export function Footer({ entries, footer }: FooterProps) {
  const pageLinks: ReadonlyArray<CtaView> = [
    ...entries.flatMap((entry) => [
      { label: entry.label, href: entry.href, isExternal: false },
      ...(entry.panel.asideHref && entry.panel.asideLabel
        ? [{ label: entry.panel.asideLabel, href: entry.panel.asideHref, isExternal: false }]
        : []),
    ]),
    footer.contactLink,
  ];
  const serviceLinks = pageLinks.filter((link) => !STUDIO_HREFS.has(link.href));
  const studioLinks = pageLinks.filter((link) => STUDIO_HREFS.has(link.href));

  return (
    <footer className="site-footer surface-dark bg-ink" data-cms-section="footer">
      <FooterSeam />

      <div className="mx-auto w-full" style={shellStyle}>
        {/* THE BAND IS ONE GRID OF FOUR AREAS — identity, contact, columns, legal — and the
            areas are what fix the alignment the client flagged. The email, the capability
            deck and the copyright used to sit on three different lines at three different
            edges: the email under the address, the deck under the email, and the copyright
            hanging off the bottom-right of the columns, near the deck by accident. A later
            pass moved the deck down beside the copyright, which changed the structure and
            left the picture almost exactly as it was.

            Now the three share ONE LINE. From md the grid has two rows: the wordmark and
            address beside the four columns, then the email and the deck beside the
            copyright, all three on a common text baseline — the email and the deck at the
            left edge under the address, the copyright at the right edge under LEGAL. It
            reads as the footer's last line, drawn once, rather than as three loose items.
            The band is a line shorter for it, too: the deck no longer takes a row of its
            own.

            ON A PHONE the areas stack in reading order — identity, contact, columns, legal —
            so the email still comes directly after the address, as the client asked, and is
            not pushed below the twelve links. That is why this is template areas and not
            the twelve-track spans it used to be: source order serves the phone, and the
            areas re-place it for the desktop without a second copy of anything.

            There is no column gap below md, for the reason the old grid had none there: at
            320 a gap between two areas that are stacked is width the page does not have. */}
        <div className="footer-band">
          <div className="footer-identity">
            <Link href="/" aria-label="Famysys Studio, home" className="footer-mark inline-flex">
              <Wordmark alt="" dark className="h-8" />
            </Link>

            {/* `not-italic` because a browser's default for `<address>` is italic and
                nothing else on this site is. */}
            {footer.addressLines === null ? null : (
              <address className="text-small mt-7 flex flex-col gap-1 text-canvas-60 not-italic">
                {footer.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            )}
          </div>

          {/* THE EMAIL AND THE DECK, ON ONE LINE UNDER THE ADDRESS. The email first and at
              body size, because it is the footer's one real call to action; the deck
              beside it and a step smaller, because it is a document about the studio
              rather than the way to reach it. Both underlined at rest — the only two
              things in the block you can act on. They wrap onto two lines only if the
              column is too narrow to hold both, which it is not at any width measured. */}
          <div className="footer-contact">
            <a href={`mailto:${footer.contactEmail}`} className="footer-email text-body font-medium">
              {footer.contactEmail}
            </a>
            <FooterDeck deck={footer.capabilityDeck} />
          </div>

          {/* Two columns at 390 and three from md. Three across a phone would put "Ways to
              Work With Us" — the longest label on the site — into a 100px track.

              FOUR TRACKS FROM XL. Each column holds exactly three links, so no one of them
              runs taller than its neighbours and the band's right side is four short
              stacks rather than one long ladder.

              The fourth track has to come from somewhere: the identity block gives one up
              at the same breakpoint, five twelfths to four. That is what buys each column
              184px at 1440 and 165px at 1280 — enough for "Ways to Work With Us", the
              longest label on the site at 143px, to hold one line. On three tracks a
              fourth column would have been 141px at 1280 and wrapped it.

              Below xl the four columns wrap onto two rows rather than being squeezed:
              three across at 1024, two at 390, and ONE below 400. Two columns at 320 is
              132px a track, which puts "Ways to Work With Us" on three lines and
              "Terms & Conditions" on two; a single column at that width is four short
              stacks rather than four ragged ones, and the order the headings already read
              in (Services, Studio, Connect, Legal) is the order they should stack in. */}
          <div className="footer-columns">
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 min-[400px]:grid-cols-2 md:grid-cols-3 md:gap-x-8 xl:grid-cols-4">
              <FooterColumn title="Services">
                {serviceLinks.map((link) => (
                  <FooterLink key={link.href} cta={link} />
                ))}
              </FooterColumn>

              <FooterColumn title="Studio">
                {studioLinks.map((link) => (
                  <FooterLink key={link.href} cta={link} />
                ))}
              </FooterColumn>

              {/* The one column that needs a browser — see FooterConnect. */}
              <FooterColumn title="Connect">
                <FooterConnect links={footer.socialLinks} pending={footer.socialPending} />
              </FooterColumn>

              <FooterColumn title="Legal">
                {footer.legalLinks.map((link) => (
                  <FooterLink key={link.href} cta={link} />
                ))}
              </FooterColumn>
            </div>
          </div>

          {/* THE COPYRIGHT, AT THE RIGHT END OF THE EMAIL'S LINE — see the note on the band.

              THE DOT AT THE END OF THE SENTENCE IS THE DOOR TO /admin, AND IT IS ALSO THE
              FULL STOP. The sentence used to end in a typed period and then carry the dot
              a short gap later, which put two dots on one line and made the real one look
              like a stray mark rather than punctuation. The typed period is gone: there is
              one dot, it sits hard against the D the way a full stop does, and it is the
              link.

              That does mean the punctuation of a sentence is clickable, which is a thing
              worth knowing rather than a thing to hide — it is the parent's own
              arrangement, and the alternative on trial here was visibly worse. At rest the
              dot is canvas-10 on ink, visible only if you know to look; on hover and on
              keyboard focus it takes the dark-ground accent.

              It keeps its accessible name and stays in the tab order, so a screen reader
              announces "Admin, link" rather than reading punctuation — a link nobody can
              reach is worse than a link nobody notices, and what it opens is a login
              rather than the panel. Obscurity is not what keeps the panel shut — the
              session check on every /admin route and endpoint is.

              THE SENTENCE IS INLINE FLOW, NOT A FLEX ROW, AND THAT IS WHAT KEEPS THE DOT
              ON THE D. As a flex container the paragraph laid the text and the dot out as
              two items side by side, so when the sentence wrapped — it does at 390, onto
              "…ALL RIGHTS / RESERVED" — the dot stayed at the end of the ROW rather than
              the end of the WORDS, and landed at the far right of the second line with
              230px of nothing between it and "RESERVED". Inline, it is the last thing
              after the last letter at every width, and it wraps with the word it follows.
              `vertical-align` is what centres it against the caps, since an empty
              inline-flex box otherwise sits on its bottom edge. */}
          <p className="footer-legal label text-canvas-60">
            &copy; {new Date().getFullYear()} Famysys Studio. All rights reserved
            <Link
              href="/admin"
              aria-label="Admin"
              className="footer-admin footer-admin--stop group"
            >
              <span className="footer-admin-dot" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

