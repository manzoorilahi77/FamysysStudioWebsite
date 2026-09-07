"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavEntryView, NavigationMenuView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { navShellStyle } from "../components/Container";
import { Wordmark } from "../components/Wordmark";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { NavPanel } from "./NavPanel";
import { MobileDrawer } from "./MobileDrawer";

const SCROLL_THRESHOLD = 80;
/** Hover has to settle before a panel opens, or crossing the bar fires every one. */
const OPEN_INTENT_MS = 120;
/** Grace on the way out, so the diagonal from trigger to panel does not close it. */
const CLOSE_GRACE_MS = 160;
/**
 * How many of the four pages sit to the LEFT of the centred wordmark. Two, and two to the
 * right — the bar is five elements now, and it is symmetrical by count as well as by
 * width: the longest label on the site, "Ways to Work With Us", is paired with the
 * shortest, "About". At 1024, the narrowest width the inline bar appears at, that leaves
 * 31px clear between the left group and the wordmark and nothing wrapping. See the
 * `entries` order in navigation.content.ts, which is what decides the pair.
 */
const START_LINK_COUNT = 2;

interface HeaderProps {
  readonly navigation: NavigationMenuView;
  /**
   * Skips the transparent state and starts the bar solid. One route passes it: /contact
   * opens on canvas, and canvas nav links over a canvas hero is a 1:1 contrast failure,
   * not a design choice. See the note on the component.
   */
  readonly solidAtTop?: boolean;
}

function hasPanel(entry: NavEntryView): boolean {
  return entry.panel.columns.length > 0 || entry.panel.features.length > 0;
}

/** A chevron says there is a panel under this item. Decorative — aria-expanded says it too. */
function Chevron() {
  return (
    <span className="nav-marker" aria-hidden="true">
      <svg
        className="nav-chevron"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        <path d="M1 1.25 5 4.75 9 1.25" />
      </svg>
    </span>
  );
}

/**
 * FIVE ELEMENTS, CENTRED: two pages, the wordmark, two pages. Three grid tracks — see
 * `.cnav` in globals.css — with two items in each of the outer two. Each item carries a
 * bracket marker before its label, and the three that have panels carry a chevron as
 * well. Below lg both groups collapse into the drawer and the wordmark stays on the centre
 * line with the Menu trigger opposite it. The bar used to collapse at xl; with two fewer
 * elements in it, it now holds down to 1024 — see `.cnav-menu` in globals.css.
 *
 * WHAT CAME OUT. The "Start a Conversation" button, which was the only thing in the bar
 * that was not a page and the reason the right track was heavier than the left; and How We
 * Work, which is now a block inside the Ways to Work With Us panel — see `NavPanelAside`.
 * /contact is still reached from the drawer's own button, from the footer, and from the
 * closing call to action every page ends on.
 *
 * TRANSPARENT AT THE TOP, SOLID INK ONCE SCROLLED. Past 80px the bar fills with ink and
 * takes its canvas-10 hairline, and it stays that way; at scroll 0 it is transparent so
 * the hero runs behind it.
 *
 * What does NOT come back with the transparency is the two-of-everything it used to
 * imply. There is one nav tone and one wordmark file, because both states are dark: at
 * the top the bar sits on a hero that is ink, and after 80px it is ink itself. The
 * cross-fade existed to survive a flip to CANVAS, and that flip is gone for good.
 *
 * Legibility at scroll 0 is carried by the hero itself. The mosaic that used to drift
 * behind these links needed `.hero-top-scrim` over it, sampled pixel by pixel; the level
 * meter that replaced it is painted UNDER `.hero-final-veil`, which is 96% ink across the
 * band the bar occupies, so there is no photography behind a link any more.
 *
 * ONE ROUTE OPTS OUT. Transparency only works while the section underneath is dark, and
 * six of the seven heroes are ink. /contact's is canvas — deliberately, it is the one page
 * shaped against famysys.com's own contact page — so a transparent bar there would put
 * canvas links on a canvas ground at 1:1. That page passes `solidAtTop` and the bar starts
 * filled. The hairline still belongs to scroll: on an already-ink bar over a canvas page
 * there is nothing for it to separate.
 *
 * The header publishes its own measured height as `--header-height`: the backdrop behind
 * an open panel starts where the bar ends. Same arrangement as `--services-anchor-offset`
 * on /creative-services.
 */
export function Header({ navigation, solidAtTop = false }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openHref, setOpenHref] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const intentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    function handleScroll(): void {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) {
      return;
    }
    function measure(): void {
      const height = headerRef.current?.offsetHeight;
      if (height !== undefined) {
        document.documentElement.style.setProperty("--header-height", `${height}px`);
      }
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--header-height");
    };
  }, []);

  const clearIntent = useCallback(() => {
    if (intentTimer.current !== null) {
      clearTimeout(intentTimer.current);
      intentTimer.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(
    (href: string) => {
      clearIntent();
      intentTimer.current = setTimeout(() => setOpenHref(href), OPEN_INTENT_MS);
    },
    [clearIntent],
  );

  const scheduleClose = useCallback(() => {
    clearIntent();
    intentTimer.current = setTimeout(() => setOpenHref(null), CLOSE_GRACE_MS);
  }, [clearIntent]);

  const closeNow = useCallback(() => {
    clearIntent();
    setOpenHref(null);
  }, [clearIntent]);

  useEffect(() => clearIntent, [clearIntent]);

  // Escape closes and hands focus back to the trigger it came from.
  useEffect(() => {
    if (openHref === null) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") {
        return;
      }
      const trigger = navRef.current?.querySelector<HTMLElement>("[aria-expanded=true]");
      closeNow();
      trigger?.focus();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openHref, closeNow]);

  /**
   * One item, in whichever of the two lists it landed in. A list item rather than a bare
   * link now: the bar draws a bracket marker before each label through `li::before`, and
   * the two groups are lists of pages, which is what a <ul> inside a <nav> is for.
   */
  function renderEntry(entry: NavEntryView) {
    if (!hasPanel(entry)) {
      return (
        <li key={entry.href}>
          <Link
            href={entry.href}
            className="nav-link"
            onMouseEnter={scheduleClose}
            onFocus={closeNow}
          >
            <span className="nav-link-label">{entry.label}</span>
          </Link>
        </li>
      );
    }

    const slug = entry.href.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    const triggerId = `nav-trigger-${slug}`;
    const panelId = `nav-panel-${slug}`;
    const isOpen = openHref === entry.href;

    return (
      <li
        key={entry.href}
        data-nav-group
        onMouseEnter={() => scheduleOpen(entry.href)}
        onMouseLeave={scheduleClose}
      >
        {/* A link, not a button. These five items are the site's five pages, and a
            top-level nav item that cannot be clicked through to its own page is a dead
            end — the page was reachable only via "View all services" inside the panel.
            So: hover opens the panel, click goes to the page.

            ARIA 1.2 supports aria-expanded on role="link", so the disclosure relationship
            survives the change. Enter navigates, which is a link's native behaviour;
            ArrowDown is what opens the panel from the keyboard, and the panel closes on
            navigation because the header stays mounted across a client-side route
            change. */}
        <Link
          id={triggerId}
          href={entry.href}
          className="nav-link"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={closeNow}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown") {
              return;
            }
            event.preventDefault();
            setOpenHref(entry.href);
            requestAnimationFrame(() => {
              const panel = document.getElementById(panelId);
              panel?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
            });
          }}
        >
          <span className="nav-link-label">{entry.label}</span>
          <Chevron />
        </Link>
        <NavPanel
          panel={entry.panel}
          isOpen={isOpen}
          onClose={closeNow}
          panelId={panelId}
          triggerId={triggerId}
        />
      </li>
    );
  }

  const startLinks = navigation.primaryLinks.slice(0, START_LINK_COUNT);
  const endLinks = navigation.primaryLinks.slice(START_LINK_COUNT);

  return (
    <header
      ref={headerRef}
      className="surface-dark fixed inset-x-0 top-0 z-40 border-b"
      style={{
        // The bar takes its OWN ground, not a section's. It is the frame the sections
        // pass behind, and giving it the dark section colour made it read as a section
        // that happened to be stuck to the top. See `headerGround` in tokens.ts.
        backgroundColor: isScrolled || solidAtTop ? "var(--color-header-ground)" : "transparent",
        borderColor: isScrolled ? "var(--color-canvas-10)" : "transparent",
        transitionProperty: "background-color, border-color",
        transitionDuration: "240ms",
        transitionTimingFunction: "var(--ease-base)",
      }}
    >
      {/* One backdrop for all three panels. It is a sibling of the bar's contents rather
          than a child of any panel, and it begins at the bottom of the bar, so the header
          stays crisp and nothing on it can be intercepted by a click meant for a link.
          Not rendered at all under reduced motion — no blur and no fade means no backdrop,
          and the panel simply opens. */}
      {prefersReducedMotion ? null : (
        <div
          className="nav-backdrop"
          data-open={openHref !== null}
          aria-hidden="true"
          style={{
            visibility: openHref === null ? "hidden" : "visible",
            // Inline, not in the stylesheet: see `.nav-backdrop` in globals.css for why
            // the compiled rule could not be trusted to carry this one.
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={closeNow}
        />
      )}

      {/* THE BAR: two pages, the wordmark, two pages.

          Three grid tracks, `1fr auto 1fr`, so the wordmark sits on the viewport's centre
          line rather than wherever the two link groups happen to leave it. Two items on
          each side, paired BY WIDTH — the longest label with the shortest — which is what
          keeps both tracks inside the shell down to 1024. The right track now carries the
          link group and, below lg, the drawer trigger; nothing else rides in it.

          The whole bar is one <nav>. Two would need two names, and there is one
          navigation here that happens to be drawn in two pieces. */}
      <div
        data-header-bar
        className="relative mx-auto w-full py-4"
        style={navShellStyle}
      >
        <nav
          ref={navRef}
          aria-label="Main"
          className="cnav"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              closeNow();
            }
          }}
        >
          <ul className="cnav-links cnav-links--start">{startLinks.map(renderEntry)}</ul>

          <Link href="/" className="cnav-wordmark" aria-label="Famysys Studio, home">
            {/* One file, both scroll states. Transparent means "on the hero", which is
                ink; scrolled means the bar is ink. Neither is light, so there is nothing
                for the ink variant to appear on and nothing to cross-fade between. */}
            <Wordmark alt="" dark priority className="h-8" />
          </Link>

          <div className="cnav-end">
            <ul className="cnav-links cnav-links--end">{endLinks.map(renderEntry)}</ul>

            {/* THE CALL TO ACTION, at the right end of the bar. The ACCENT-filled light
                primary — the same fill and the same canvas label the hero's own primary
                button carries, which is what the client asked it to match. The label
                reads 8.594:1 on that fill, well over the 4.5:1 it needs; the FILL reads
                1.837:1 against the bar, under the 3:1 that 1.4.11 puts on a boundary
                identifying a control, which is why `.header-cta-primary` draws a hairline
                in the lightened accent at 9.661:1. Both numbers come from
                `npm run check-colours`, which carries a row for each.

                `.cnav-cta` is what makes it the BAR's button rather than the hero's: the
                same colour and shape at a smaller size, because at the hero's 15px label
                and 24px padding the six elements no longer hold one line at 1024. */}
            <div className="cnav-actions">
              <Button
                cta={navigation.primaryCta}
                variant="primary"
                rollOnHover
                className="header-cta-primary cnav-cta"
              />
            </div>

            <button
              ref={drawerTriggerRef}
              id="mobile-drawer-trigger"
              type="button"
              className="label cnav-menu text-canvas"
              aria-expanded={isDrawerOpen}
              aria-controls="mobile-drawer"
              onClick={() => setIsDrawerOpen(true)}
            >
              Menu
            </button>
          </div>
        </nav>
      </div>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        entries={navigation.primaryLinks}
        primaryCta={navigation.primaryCta}
        panelId="mobile-drawer"
        triggerId="mobile-drawer-trigger"
        triggerRef={drawerTriggerRef}
      />
    </header>
  );
}
