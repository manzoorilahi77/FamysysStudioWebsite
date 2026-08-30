"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavEntryView, NavigationMenuView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { Wordmark } from "../components/Wordmark";
import { NavPanel } from "./NavPanel";
import { MobileDrawer } from "./MobileDrawer";

const SCROLL_THRESHOLD = 80;
/** Hover has to settle before a panel opens, or crossing the bar fires every one. */
const OPEN_INTENT_MS = 120;
/** Grace on the way out, so the diagonal from trigger to panel does not close it. */
const CLOSE_GRACE_MS = 160;

interface HeaderProps {
  readonly navigation: NavigationMenuView;
}

function hasPanel(entry: NavEntryView): boolean {
  return entry.panel.columns.length > 0 || entry.panel.features.length > 0;
}

export function Header({ navigation }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openHref, setOpenHref] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const intentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleScroll(): void {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
      const trigger = navRef.current?.querySelector<HTMLButtonElement>("[aria-expanded=true]");
      closeNow();
      trigger?.focus();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openHref, closeNow]);

  const isDark = !isScrolled;
  const surfaceToneClass = isDark ? "nav-link--dark" : "nav-link--light";
  // While unscrolled the bar is transparent over the ink hero, so its focus rings need the
  // dark-surface ring colour; once it fills with canvas they go back to the raw accent. The
  // panels and drawer hang off this element and opt back out with .surface-light.
  const surfaceClass = isDark ? "surface-dark" : "";

  return (
    <header
      className={`transition-base fixed inset-x-0 top-0 z-40 border-b ${surfaceClass}`}
      style={{
        backgroundColor: isScrolled ? "var(--color-canvas)" : "transparent",
        borderColor: isScrolled ? "var(--color-ink-8)" : "transparent",
        backdropFilter: isScrolled ? "blur(8px)" : "none",
        transitionDuration: "240ms",
      }}
    >
      {/* The real site's page names ("Ways to Work With Us", "Creative Services")
          are long enough that the inline nav needs the full container width and
          only fits from xl up — below that it collapses to the drawer.
          The link group is tight and the button pair is pushed away from it, so the
          bar reads as two groups rather than one evenly-spread row. */}
      <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-6 py-4">
        <Link href="/" className="shrink-0" aria-label="Famysys Studio, home">
          <Wordmark alt="" dark={isDark} crossfade priority className="h-7" />
        </Link>

        <nav
          ref={navRef}
          aria-label="Main"
          className="ml-auto hidden items-center gap-1 xl:flex"
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
                  className={`nav-link ${surfaceToneClass}`}
                  onMouseEnter={scheduleClose}
                  onFocus={closeNow}
                >
                  <span className="nav-link-label">{entry.label}</span>
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
                <button
                  id={triggerId}
                  type="button"
                  className={`nav-link ${surfaceToneClass}`}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => (isOpen ? closeNow() : setOpenHref(entry.href))}
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
                </button>
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

        <div className="ml-6 hidden shrink-0 items-center gap-3 xl:flex">
          <Button cta={navigation.signIn} variant="ghost" dark={isDark} />
          <Button cta={navigation.primaryCta} variant="primary" dark={isDark} />
        </div>

        <button
          ref={drawerTriggerRef}
          id="mobile-drawer-trigger"
          type="button"
          className={`label transition-base ml-auto xl:hidden ${isDark ? "text-canvas" : "text-ink"}`}
          style={{ transitionDuration: "240ms" }}
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
