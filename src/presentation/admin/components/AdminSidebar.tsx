"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_GROUPS } from "../adminNavigation";
import { Wordmark } from "../../components/Wordmark";

/**
 * The one client component in the admin panel, and only because the active item has to
 * be decided from the current URL. Everything else here renders on the server.
 *
 * ACTIVE IS EXACT, WITH ONE EXCEPTION. `/admin` would otherwise be the prefix of every
 * other route and light up permanently, so the dashboard matches exactly while a section
 * also matches its own detail pages beneath it.
 *
 * The active fill runs to the sidebar's right edge rather than sitting in an inset pill:
 * flush against the content it introduces, the item reads as attached to the panel beside
 * it, which is the whole job of an active state in a two-column shell.
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex h-full flex-col gap-8 py-7">
      <Link href="/admin" className="px-6" aria-label="Famysys Studio admin, dashboard">
        <Wordmark alt="" dark className="h-7" />
      </Link>

      <div className="flex flex-col gap-7">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label || "root"}>
            {group.label ? <p className="label px-6 pb-3 text-canvas-40">{group.label}</p> : null}
            <ul>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      // 180ms, the site's `motion.duration.fast` — the only transition
                      // the admin uses, on hover and active states and nowhere else.
                      className={`block py-2 pl-6 pr-4 text-small transition-colors duration-[180ms] ${
                        active
                          ? "bg-canvas-10 text-canvas"
                          : "text-canvas-60 hover:bg-canvas-4 hover:text-canvas"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
