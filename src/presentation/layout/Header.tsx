"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NavigationMenuView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { MegaMenu } from "./MegaMenu";
import { MobileDrawer } from "./MobileDrawer";

const SCROLL_THRESHOLD = 80;

interface HeaderProps {
  readonly navigation: NavigationMenuView;
}

export function Header({ navigation }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const megaWrapperRef = useRef<HTMLDivElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleScroll(): void {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [servicesLink, ...restLinks] = navigation.primaryLinks;
  const isDark = !isScrolled;
  const textClass = `transition-base ${isDark ? "text-canvas" : "text-ink"}`;
  // While unscrolled the bar is transparent over the ink hero, so its focus rings need the
  // dark-surface ring colour; once it fills with canvas they go back to the raw accent. The
  // mega menu and drawer hang off this element and opt back out with .surface-light.
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
          only fits from xl up — below that it collapses to the drawer. */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className={`text-display-s font-medium ${textClass}`} style={{ transitionDuration: "240ms" }}>
          Famysys Studio
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
          {servicesLink ? (
            <div
              ref={megaWrapperRef}
              className="relative"
              onMouseEnter={() => setIsMegaOpen(true)}
              onMouseLeave={() => setIsMegaOpen(false)}
            >
              <button
                id="mega-menu-trigger"
                type="button"
                className={`text-small font-medium ${textClass}`}
                style={{ transitionDuration: "240ms" }}
                aria-expanded={isMegaOpen}
                aria-controls="mega-menu-panel"
                onClick={() => setIsMegaOpen((open) => !open)}
              >
                {servicesLink.label}
              </button>
              <MegaMenu
                columns={navigation.megaMenu}
                isOpen={isMegaOpen}
                onClose={() => setIsMegaOpen(false)}
                panelId="mega-menu-panel"
                triggerId="mega-menu-trigger"
              />
            </div>
          ) : null}
          {restLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-small font-medium ${textClass}`}
              style={{ transitionDuration: "240ms" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <Button cta={navigation.signIn} variant="ghost" dark={isDark} />
          <Button cta={navigation.primaryCta} variant="primary" dark={isDark} />
        </div>

        <button
          ref={drawerTriggerRef}
          id="mobile-drawer-trigger"
          type="button"
          className={`label xl:hidden ${textClass}`}
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
        primaryLinks={navigation.primaryLinks}
        megaMenuColumns={navigation.megaMenu}
        signIn={navigation.signIn}
        primaryCta={navigation.primaryCta}
        panelId="mobile-drawer"
        triggerId="mobile-drawer-trigger"
        triggerRef={drawerTriggerRef}
      />
    </header>
  );
}
