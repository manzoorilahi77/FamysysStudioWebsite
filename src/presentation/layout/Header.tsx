"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavEntryView, NavigationMenuView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { shellStyle } from "../components/Container";
import { Wordmark } from "../components/Wordmark";
import { HeaderLogo } from "../components/HeaderLogo";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { NavPanel } from "./NavPanel";
import { MobileDrawer } from "./MobileDrawer";

const SCROLL_THRESHOLD = 80;
/** Hover has to settle before a panel opens, or crossing the bar fires every one. */
const OPEN_INTENT_MS = 120;
/** Grace on the way out, so the diagonal from trigger to panel does not close it. */
const CLOSE_GRACE_MS = 160;

interface HeaderProps {
  readonly navigation: NavigationMenuView;
  /**
   * Skips the transparent state and starts the bar solid. One route passes it: /contact
   * opens on canvas, and canvas nav links over a canvas hero is a 1:1 contrast failure,
   * not a design choice. See the note on the component.
   */
  readonly solidAtTop?: boolean;
  /**
   * Homepage only: the wordmark starts large in the hero and travels into the bar's slot
   * as the page scrolls — see HeaderLogo. Every other page renders the plain wordmark.
   */
  readonly heroLogo?: boolean;
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

/** A dot says there is not. It appears on hover only, so at rest the bar stays quiet. */
function Dot() {
  return (
    <span className="nav-marker" aria-hidden="true">
      <span className="nav-dot" />
    </span>
  );
}

/**
 * TRANSPARENT AT THE TOP, SOLID INK ONCE SCROLLED. Past 80px the bar fills with ink and
 * takes its canvas-10 hairline, and it stays that way; at scroll 0 it is transparent so
 * the hero mosaic runs behind it.
 *
 * What does NOT come back with the transparency is the two-of-everything it used to
 * imply. There is one nav tone and one wordmark file, because both states are dark: at
 * the top the bar sits on a hero that is ink, and after 80px it is ink itself. The
 * cross-fade existed to survive a flip to CANVAS, and that flip is gone for good.
 *
 * Legibility at scroll 0 is a photography problem, not a token problem — the mosaic
 * drifts behind the links — and it is answered by `.hero-top-scrim`, which is verified by
 * sampling the rendered pixels behind each link rather than by anything axe can check.
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
export function Header({ navigation, solidAtTop = false, heroLogo = false }: HeaderProps) {
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

      {/* The real site's page names ("Ways to Work With Us", "Creative Services")
          are long enough that the inline nav needs the full container width and
          only fits from xl up — below that it collapses to the drawer.
          The link group is tight and the button pair is pushed well away from it, so the
          bar reads as two groups rather than one evenly-spread row. */}
      <div
        data-header-bar
        className="relative mx-auto flex w-full items-center gap-6 py-4"
        style={shellStyle}
      >
        <Link href="/" className="shrink-0" aria-label="Famysys Studio, home">
          {/* One file, both scroll states. Transparent means "on the hero", which is ink;
              scrolled means the bar is ink. Neither is light, so there is nothing for the
              ink variant to appear on and nothing to cross-fade between. That file is
              still the one the footer and the contact card use.

              On the homepage the slot is held by HeaderLogo instead: an invisible spacer
              keeps this exact layout while the visible wordmark starts large in the hero
              and travels here with scroll. */}
          {heroLogo ? <HeaderLogo /> : <Wordmark alt="" dark priority className="h-8" />}
        </Link>

        <nav
          ref={navRef}
          aria-label="Main"
          className="ml-auto hidden items-center xl:flex"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              closeNow();
            }
          }}
        >
          {navigation.primaryLinks.map((entry) => {
            if (!hasPanel(entry)) {
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="nav-link"
                  onMouseEnter={scheduleClose}
                  onFocus={closeNow}
                >
                  <span className="nav-link-label">{entry.label}</span>
                  <Dot />
                </Link>
              );
            }

            const slug = entry.href.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
            const triggerId = `nav-trigger-${slug}`;
            const panelId = `nav-panel-${slug}`;
            const isOpen = openHref === entry.href;

            return (
              <div
                key={entry.href}
                data-nav-group
                onMouseEnter={() => scheduleOpen(entry.href)}
                onMouseLeave={scheduleClose}
              >
                {/* A link, not a button. These five items are the site's five pages, and a
                    top-level nav item that cannot be clicked through to its own page is a
                    dead end — the page was reachable only via "View all services" inside
                    the panel. So: hover opens the panel, click goes to the page.

                    ARIA 1.2 supports aria-expanded on role="link", so the disclosure
                    relationship survives the change. Enter navigates, which is a link's
                    native behaviour; ArrowDown is what opens the panel from the keyboard,
                    and the panel closes on navigation because the header stays mounted
                    across a client-side route change. */}
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
              </div>
            );
          })}
        </nav>

        {/* The two buttons take the tones the brief names, which cut across the component's
            own dark/light split: the CTA is the ACCENT-filled light primary (canvas text at
            5.107:1 on the fill) and the ghost is the DARK one (canvas-40 border, canvas
            text), because it is the ghost that has to sit on ink and the CTA that has to
            carry the accent. `.header-cta-primary` adds the hairline that gives the accent
            fill a perceivable edge against the bar — see globals.css. */}
        <div className="ml-10 hidden shrink-0 items-center gap-3 xl:flex">
          <Button cta={navigation.signIn} variant="ghost" dark rollOnHover />
          <Button
            cta={navigation.primaryCta}
            variant="primary"
            rollOnHover
            className="header-cta-primary"
          />
        </div>

        <button
          ref={drawerTriggerRef}
          id="mobile-drawer-trigger"
          type="button"
          className="label ml-auto text-canvas xl:hidden"
          aria-expanded={isDrawerOpen}
          aria-controls="mobile-drawer"
          onClick={() => setIsDrawerOpen(true)}
        >
          Menu
        </button>
      </div>

      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        entries={navigation.primaryLinks}
        signIn={navigation.signIn}
        primaryCta={navigation.primaryCta}
        panelId="mobile-drawer"
        triggerId="mobile-drawer-trigger"
        triggerRef={drawerTriggerRef}
      />
    </header>
  );
}
