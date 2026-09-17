"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdminNavigation } from "../../../application/cms/GetAdminNavigation";
import type { CapabilityDeckNavigation } from "../../../application/capability-deck/GetCapabilityDeckNavigation";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useScrollLock } from "../../hooks/useScrollLock";
import { AdminSidebar } from "./AdminSidebar";

/**
 * Two columns for the whole panel: a 256px sidebar on the dark ground and the content on the
 * page ground beside it — FROM lg. Below it there is one column and the sidebar is a drawer
 * behind a button on a bar at the top.
 *
 * WHY THE RAIL COULD NOT SIMPLY NARROW. It is a fixed 256px, and the main column is
 * `flex-1 min-w-0`, so at 390 the editor got 134px: every field label wrapped four times,
 * the save bar's three buttons stacked into a column of their own, and the preview frame
 * was narrower than the phone rendering inside it. There is no width at which a permanent
 * rail and a usable editor both fit on a phone, so the rail stops being permanent.
 *
 * The client will not lay a page out from a phone. What they will do is fix a typo, read
 * an enquiry, and publish — and all three of those are the main column. So the main column
 * gets the screen and the navigation is one tap away, rather than both being cramped.
 *
 * The drawer is the same component as the rail, rendered once. Two navigations would be two
 * things to keep in step, and the draft dots are the reason the sidebar exists at all.
 *
 * Scroll lock, focus trap, Escape and focus return are the site's own — the same three hooks
 * the public drawer uses, for the same reasons.
 */
export function AdminShell({
  navigation,
  capabilityDeck,
  children,
}: {
  readonly navigation: AdminNavigation;
  readonly capabilityDeck: CapabilityDeckNavigation;
  readonly children: ReactNode;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  /**
   * `lg`, read in JavaScript rather than inferred from a utility class, because ONE
   * attribute here cannot be expressed in CSS at all: `inert`. A closed drawer has to be
   * inert or its twenty-odd links keep their tab stops behind a panel nobody can see —
   * and the same element is the permanent rail from lg up, where inert would make the
   * whole navigation dead. There is no `lg:` version of an attribute, so the width has to
   * be a value. Everything else about the two arrangements stays in the class list.
   *
   * False until the client has rendered, which means the markup that arrives has the
   * drawer inert. That is the right default: without JavaScript there is no trigger to
   * open it with, and the panel is one tap away at /admin either way.
   */
  const isRail = useMediaQuery("(min-width: 1024px)");

  useScrollLock(isDrawerOpen);
  useFocusTrap(drawerRef, isDrawerOpen);

  // Navigating is what the drawer is FOR, so arriving anywhere closes it. Without this the
  // panel would stay open over the screen it just opened, which on a phone is the whole
  // screen.
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }
    drawerRef.current?.focus();
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-canvas lg:flex-row">
      {/* THE BAR, below lg only. It carries the drawer trigger and nothing else: the screen
          under it already says where you are, through the breadcrumb `AdminScreen` renders. */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-canvas-10 bg-ink px-4 py-2 lg:hidden">
        <button
          ref={triggerRef}
          type="button"
          className="text-small inline-flex min-h-11 items-center gap-2 px-2 text-canvas"
          aria-expanded={isDrawerOpen}
          aria-controls="admin-drawer"
          onClick={() => setIsDrawerOpen(true)}
        >
          <span aria-hidden="true" className="flex flex-col gap-[3px]">
            <span className="block h-px w-4 bg-canvas" />
            <span className="block h-px w-4 bg-canvas" />
            <span className="block h-px w-4 bg-canvas" />
          </span>
          Sections
        </button>
      </div>

      {/* One element carrying both arrangements. Below lg it is a fixed overlay panel; from
          lg it is the sticky rail it has always been, and every drawer-only property is
          undone by a `lg:` utility rather than by a second copy of the sidebar. */}
      <div
        ref={drawerRef}
        id="admin-drawer"
        tabIndex={-1}
        {...(isDrawerOpen && !isRail
          ? { role: "dialog" as const, "aria-modal": true, "aria-label": "Admin sections" }
          : {})}
        inert={!isRail && !isDrawerOpen ? true : undefined}
        className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] overflow-y-auto bg-ink transition-transform duration-[180ms] lg:static lg:z-auto lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:overflow-visible lg:transition-none ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="flex justify-end px-4 pt-3 lg:hidden">
            <button
              type="button"
              className="label -mr-2 inline-flex min-h-11 min-w-11 items-center justify-end px-2 text-canvas-60"
              onClick={() => {
                setIsDrawerOpen(false);
                triggerRef.current?.focus();
              }}
            >
              Close
            </button>
          </div>
          <AdminSidebar navigation={navigation} capabilityDeck={capabilityDeck} />
        </div>
      </div>

      {/* Decorative: Escape and the Close button are what a keyboard gets, and the panel
          itself is `inert` while shut, so this is a convenience for a thumb. */}
      {isDrawerOpen ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-ink-40 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      ) : null}

      <main id="main-content" className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}
