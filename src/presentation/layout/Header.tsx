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

  return (
    <header
      className="transition-base fixed inset-x-0 top-0 z-40 border-b"
      style={{
        backgroundColor: isScrolled ? "var(--color-canvas)" : "transparent",
        borderColor: isScrolled ? "var(--color-ink-8)" : "transparent",
        backdropFilter: isScrolled ? "blur(8px)" : "none",
        transitionDuration: "240ms",
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-display-s font-medium text-ink">
          Famysys Studio
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
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
                className="text-small font-medium text-ink"
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
            <Link key={link.href} href={link.href} className="text-small font-medium text-ink">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Button cta={navigation.signIn} variant="ghost" />
          <Button cta={navigation.primaryCta} variant="primary" />
        </div>

        <button
          ref={drawerTriggerRef}
          id="mobile-drawer-trigger"
          type="button"
          className="label text-ink lg:hidden"
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
