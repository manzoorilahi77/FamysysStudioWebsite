"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { AdminNavigation } from "../../../application/cms/GetAdminNavigation";
import type { CapabilityDeckNavigation } from "../../../application/capability-deck/GetCapabilityDeckNavigation";
import { Wordmark } from "../../components/Wordmark";

/**
 * A DASHBOARD, SEVEN PAGES, AN SEO SCREEN, AND AN INBOX. Nothing else, ever again.
 *
 * The list is not written here — see `GetAdminNavigation`. What this file decides is only
 * how it behaves: a page expands in place to show the blocks it renders, in the order the
 * page renders them, and selecting one opens its editor beside the sidebar. Nobody has to
 * go back to a list screen to move between two sections of the same page. Dashboard and SEO
 * are plain links, the same shape the inbox has always been — a fixed destination with no
 * section list of its own.
 *
 * WHAT IS OPEN. The page you are on, always — arriving at a section must not leave its
 * page collapsed. Beyond that it is the editor's own toggling, held in state, so opening a
 * second page to compare two blocks does not close the first.
 *
 * THE DOT. A section with unpublished edits carries one, and so does its page. It is the
 * whole reason the sidebar knows about drafts: "where did I leave that half-finished
 * change" should be answerable by looking, not by opening seven pages.
 */

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The unpublished-edits mark. Announced as well as drawn — colour is never the only cue. */
function DraftDot({ what }: { readonly what: string }) {
  return (
    <span
      className="ml-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent align-middle"
      role="img"
      aria-label={`${what} has unpublished edits`}
    />
  );
}

/** A plain fixed-destination row — Dashboard, SEO. Same shape the Inbox link has always been. */
function SidebarLink({
  href,
  label,
  active,
}: {
  readonly href: string;
  readonly label: string;
  readonly active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`text-small flex min-h-11 items-center py-2 pl-6 pr-4 transition-colors duration-[180ms] ${
          active ? "bg-canvas-10 text-canvas" : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
        }`}
        aria-current={active ? "page" : undefined}
      >
        {label}
      </Link>
    </li>
  );
}

export function AdminSidebar({
  navigation,
  capabilityDeck,
}: {
  readonly navigation: AdminNavigation;
  readonly capabilityDeck: CapabilityDeckNavigation;
}) {
  const pathname = usePathname();
  const [opened, setOpened] = useState<ReadonlyArray<string>>([]);
  const [deckOpen, setDeckOpen] = useState(false);

  return (
    <nav aria-label="Admin sections" className="flex h-full flex-col gap-8 py-7">
      <Link href="/admin" className="flex min-h-11 items-center px-6" aria-label="Famysys Studio admin">
        <Wordmark alt="" dark className="h-7" />
      </Link>

      <div className="flex flex-col gap-7">
        <div>
          <ul>
            <SidebarLink
              href={navigation.dashboard.href}
              label="Dashboard"
              active={isActive(pathname, navigation.dashboard.href)}
            />
          </ul>
        </div>

        <div>
          <p className="label px-6 pb-3 text-canvas-40">Pages</p>
          <ul>
            {navigation.pages.map((page) => {
              const onThisPage = isActive(pathname, page.href);
              const expanded = onThisPage || opened.includes(page.id);
              const listId = `admin-nav-${page.id}`;

              return (
                <li key={page.id}>
                  <div className="flex items-stretch">
                    <Link
                      href={page.href}
                      // 180ms, the site's `motion.duration.fast` — the only transition
                      // the admin uses, on hover and active states and nowhere else.
                      className={`text-small flex min-h-11 min-w-0 flex-1 items-center truncate py-2 pl-6 pr-2 transition-colors duration-[180ms] ${
                        pathname === page.href
                          ? "bg-canvas-10 text-canvas"
                          : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
                      }`}
                      aria-current={pathname === page.href ? "page" : undefined}
                    >
                      {page.label}
                      {page.status === "draft" ? <DraftDot what={page.label} /> : null}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setOpened((current) =>
                          current.includes(page.id)
                            ? current.filter((id) => id !== page.id)
                            : [...current, page.id],
                        )
                      }
                      aria-expanded={expanded}
                      aria-controls={listId}
                      aria-label={`${expanded ? "Collapse" : "Expand"} ${page.label}`}
                      className="flex min-h-11 min-w-11 items-center justify-center px-4 text-canvas-40 transition-colors duration-[180ms] hover:text-canvas"
                    >
                      <span aria-hidden="true" className="text-small">
                        {expanded ? "−" : "+"}
                      </span>
                    </button>
                  </div>

                  <ul id={listId} hidden={!expanded}>
                    {page.sections.map((section) => {
                      const active = pathname === section.href;
                      return (
                        <li key={section.id}>
                          <Link
                            href={section.href}
                            className={`text-small flex min-h-11 items-center py-1.5 pl-10 pr-4 transition-colors duration-[180ms] ${
                              active
                                ? "bg-canvas-10 text-canvas"
                                : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
                            }`}
                            aria-current={active ? "page" : undefined}
                          >
                            {section.label}
                            {section.status === "draft" ? <DraftDot what={section.label} /> : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="label px-6 pb-3 text-canvas-40">Capability Deck</p>
          <ul>
            <li>
              <div className="flex items-stretch">
                <Link
                  href={capabilityDeck.href}
                  className={`text-small flex min-h-11 min-w-0 flex-1 items-center truncate py-2 pl-6 pr-2 transition-colors duration-[180ms] ${
                    pathname === capabilityDeck.href ? "bg-canvas-10 text-canvas" : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
                  }`}
                  aria-current={pathname === capabilityDeck.href ? "page" : undefined}
                >
                  Capability Deck
                  {capabilityDeck.status === "draft" ? <DraftDot what="Capability Deck" /> : null}
                </Link>
                <button
                  type="button"
                  onClick={() => setDeckOpen((c) => !c)}
                  aria-expanded={deckOpen}
                  aria-controls="admin-nav-capability-deck"
                  aria-label={`${deckOpen ? "Collapse" : "Expand"} Capability Deck`}
                  className="flex min-h-11 min-w-11 items-center justify-center px-4 text-canvas-40 transition-colors duration-[180ms] hover:text-canvas"
                >
                  <span aria-hidden="true" className="text-small">{deckOpen ? "−" : "+"}</span>
                </button>
              </div>
              <ul id="admin-nav-capability-deck" hidden={!(deckOpen || isActive(pathname, capabilityDeck.href))}>
                {capabilityDeck.slides.map((slide) => (
                  <li key={slide.id}>
                    <Link
                      href={slide.href}
                      className={`text-small flex min-h-11 items-center py-1.5 pl-10 pr-4 transition-colors duration-[180ms] ${
                        pathname === slide.href ? "bg-canvas-10 text-canvas" : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
                      }`}
                      aria-current={pathname === slide.href ? "page" : undefined}
                    >
                      {slide.label}
                      {slide.status === "draft" ? <DraftDot what={slide.label} /> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <ul>
            <SidebarLink
              href={navigation.seo.href}
              label="SEO"
              active={isActive(pathname, navigation.seo.href)}
            />
          </ul>
        </div>

        <div>
          <ul>
            <li>
              <Link
                href={navigation.inbox.href}
                className={`text-small flex min-h-11 items-center justify-between gap-3 py-2 pl-6 pr-4 transition-colors duration-[180ms] ${
                  isActive(pathname, navigation.inbox.href)
                    ? "bg-canvas-10 text-canvas"
                    : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
                }`}
                aria-current={isActive(pathname, navigation.inbox.href) ? "page" : undefined}
              >
                <span>Inbox</span>
                {navigation.inbox.unread > 0 ? (
                  <span className="label rounded-sm bg-accent px-1.5 py-0.5 text-ink">
                    {navigation.inbox.unread}
                    <span className="sr-only"> unread enquiries</span>
                  </span>
                ) : null}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
