import Link from "next/link";
import type {
  CtaView,
  FooterContentView,
  FooterSocialLinkView,
  NavEntryView,
} from "../lib/viewModels";
import { shellStyle } from "../components/Container";
import { Wordmark } from "../components/Wordmark";
import { FooterSeam } from "./FooterSeam";

interface FooterProps {
  readonly entries: ReadonlyArray<NavEntryView>;
  readonly footer: FooterContentView;
}

/**
 * A column of links under a small tracked heading. Three of them sit in the upper band,
 * and they are `<nav>` elements rather than `<div>`s: each is a named group of
 * destinations, which is what gives a screen reader "Explore", "Connect" and "Legal" as
 * landmarks it can jump between instead of one undifferentiated list of eleven links.
 */
function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <p className="label text-canvas-60">{title}</p>
      <ul className="mt-6 flex flex-col gap-3.5">{children}</ul>
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
 * A CONNECT entry. With a handle it is a link that opens in a new tab; without one it is
 * the name on its own — deliberately not an anchor. An `<a href="#">` would look and
 * behave like a working link, scroll the reader to the top of the page when clicked, and
 * announce itself to a screen reader as a destination that does not exist. The name alone
 * says the same thing the parent's column says (the Studio is on these networks) without
 * promising a page that has not been supplied.
 */
function FooterSocialItem({ link }: { link: FooterSocialLinkView }) {
  if (link.href === null) {
    return (
      <li>
        <span className="footer-link text-small footer-link--unlinked">{link.label}</span>
      </li>
    );
  }

  return (
    <li>
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="footer-link text-small"
      >
        {link.label}
      </a>
    </li>
  );
}

/**
 * THE SITE FOOTER, SHAPED AGAINST famysys.com's OWN.
 *
 * Two bands, as the parent has them:
 *
 *   UPPER — the wordmark and the tagline on the left, then EXPLORE, CONNECT and LEGAL as
 *   three columns of links on the right.
 *
 *   LOWER, under a hairline — "Get in touch" and the email address at display size on the
 *   left; the copyright and the descriptor line, small and tracked, bottom-aligned on the
 *   right.
 *
 * WHAT IS THE PARENT'S AND WHAT IS THE STUDIO'S. The structure, the column names and the
 * lower band's arrangement are the parent's, deliberately — this is the same company and
 * the two footers should read as one family. The ground is not: famysys.com's footer is
 * cream, and this one is the Studio's own dark forest ink, so every value here comes from
 * the canvas-on-ink scale rather than from the parent's ink-on-canvas one.
 *
 * WHAT IS MISSING, AND WHY IT IS MISSING RATHER THAN BORROWED. The parent's footer prints
 * a postal address and links three social accounts. Both belong to the parent company,
 * and nothing in the brief says the Studio shares either. So the address block does not
 * render at all and the three network names carry no links — see the notes in
 * marketing.content.ts and the entries in docs/content-todo.md. The alternative, printing
 * the parent's address and pointing "LinkedIn" at the parent's profile, would be wrong on
 * every page of the site rather than absent from it.
 *
 * THE PAGE COLUMNS ARE DERIVED, NOT LISTED. They read the navigation, from the same
 * source the header reads, so they cannot drift from the menu — and that includes the
 * pages the BAR does not name. How We Work is one: it is not a top-level bar item any
 * more, it is a block inside the Ways to Work With Us panel, and it is picked up here from
 * that block rather than retyped, so the footer lists all six content pages either way.
 *
 * Only Contact is named in content, because it is not a navigation item at all — the bar
 * used to reach it through a CTA button, which has been removed, and the drawer still
 * does.
 *
 * SIX PAGES, TWO COLUMNS OF THREE, SPLIT BY WHAT THEY ARE. It was one column called
 * "Explore" holding all six, which ran twice the height of Connect and Legal beside it and
 * said nothing about the pages except that they exist. SERVICES is what the studio sells
 * and how buying it works; STUDIO is who is selling and the proof — the work, the company,
 * the way in. A reader looking for a price and a reader looking for a portfolio are not
 * the same reader, and one heading over six links helped neither.
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
    <footer className="site-footer surface-dark bg-ink">
      <FooterSeam />

      <div className="mx-auto w-full" style={shellStyle}>
        {/* Twelve tracks, five for the brand and seven for the columns — the parent's
            split. The tagline is capped at 34ch so it breaks into three lines rather than
            running the full five tracks and leaving a column of white beside the links. */}
        {/* `gap-x` STARTS AT ZERO AND ONLY OPENS AT md, and that is a bug fix rather than
            a nicety. A twelve-track grid with a 32px column gap has eleven of them, so it
            cannot be narrower than 352px however far the tracks collapse — `minmax(0, 1fr)`
            gives up the tracks and not the gaps. At 320 the content box is 288px, so the
            footer was 64px wider than the page and every one of the seven pages scrolled
            sideways because of it. Below md both children are `col-span-12` and sit one
            above the other, so there is no column gap to want. */}
        <div className="grid grid-cols-12 gap-y-12 pt-20 pb-12 md:gap-x-8">
          <div className="col-span-12 md:col-span-5 xl:col-span-4">
            <Link href="/" aria-label="Famysys Studio, home" className="footer-mark inline-flex">
              <Wordmark alt="" dark className="h-8" />
            </Link>
            <p className="text-small mt-6 max-w-[34ch] text-canvas-60">{footer.tagline}</p>
          </div>

          {/* Two columns at 390 and three from md. Three across a phone would put "Ways to
              Work With Us" — the longest label on the site — into a 100px track.

              FOUR TRACKS FROM XL, with Explore taking two of them. Explore lists all six
              content pages against Connect's three and Legal's two, so as one stack it ran
              twice the height of the columns beside it and the band's whole right side was
              a single tall ladder. Split three and three it matches them.

              The extra track has to come from somewhere: the brand block gives one up at
              the same breakpoint, five twelfths to four. That is what buys each column
              184px at 1440 and 165px at 1280 — enough for "Ways to Work With Us", the
              longest label on the site at 143px, to hold one line. On the three tracks
              this had, a fourth column would have been 141px at 1280 and wrapped it.

              Below xl the four columns wrap onto two rows rather than being squeezed:
              three across at 1024, two at 390, and ONE below 400. Two columns at 320 is
              132px a track, which puts "Ways to Work With Us" — the longest label on the
              site — on three lines and "Terms & Conditions" on two; a single column at that
              width is four short stacks rather than four ragged ones, and the order the
              headings already read in (Services, Studio, Connect, Legal) is the order they
              should stack in anyway. */}
          <div className="col-span-12 grid grid-cols-1 gap-x-6 gap-y-10 min-[400px]:grid-cols-2 md:col-span-7 md:grid-cols-3 md:gap-x-8 xl:col-span-8 xl:grid-cols-4">
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

            <FooterColumn title="Connect">
              {footer.socialLinks.map((link) => (
                <FooterSocialItem key={link.label} link={link} />
              ))}
            </FooterColumn>

            <FooterColumn title="Legal">
              {footer.legalLinks.map((link) => (
                <FooterLink key={link.href} cta={link} />
              ))}
            </FooterColumn>
          </div>
        </div>

        {/* The lower band. `items-end` from sm so the copyright block sits on the same
            baseline as the bottom of the address column rather than floating at its top. */}
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-8 border-t border-canvas-10 pt-10 pb-12 sm:items-end">
          <div>
            <p className="label text-canvas-60">Get in touch</p>
            <a
              href={`mailto:${footer.contactEmail}`}
              className="footer-email text-display-m mt-4"
            >
              {footer.contactEmail}
            </a>
            {footer.addressLines === null ? null : (
              <address className="text-small mt-5 flex flex-col gap-0.5 text-canvas-60 not-italic">
                {footer.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            )}
          </div>

          <div className="flex flex-col gap-2.5 sm:items-end sm:text-right">
            <p className="label text-canvas-60">
              &copy; {new Date().getFullYear()} Famysys Studio. All rights reserved.
            </p>
            {/* THE DOT AT THE END OF THIS LINE IS THE DOOR TO /admin.
                It was the full stop after "Famysys Studio" before, which made the
                punctuation of a sentence clickable; the parent puts a 5px dot at the end
                of this same line, and that is both easier to hit and easier to leave
                alone. At rest it is canvas-10 on ink — visible only if you know to look.
                On hover and on keyboard focus it takes the dark-ground accent.

                It keeps its accessible name and stays in the tab order: a link nobody can
                reach is worse than a link nobody notices, and what it opens is a login
                rather than the panel. Obscurity is not what keeps the panel shut — the
                session check on every /admin route and endpoint is. */}
            <p className="label flex items-center gap-2 text-canvas-60 sm:justify-end">
              {footer.descriptor}
              <Link href="/admin" aria-label="Admin" className="footer-admin group">
                <span className="footer-admin-dot" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
