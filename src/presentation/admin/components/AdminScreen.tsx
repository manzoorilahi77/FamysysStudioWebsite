import Link from "next/link";
import type { ReactNode } from "react";
import { AccountMenu } from "./AccountMenu";

export interface Crumb {
  readonly label: string;
  /** Omitted for the last crumb, which is the screen you are on. */
  readonly href?: string;
}

interface AdminScreenProps {
  readonly breadcrumb: ReadonlyArray<Crumb>;
  readonly heading: string;
  readonly description: string;
  readonly children: ReactNode;
}

/**
 * Every admin screen is this: breadcrumb and account across the top, a heading with the
 * paragraph that explains what the screen is for, a hairline, and then whatever panel the
 * screen puts under it.
 *
 * The explanatory paragraph is not decoration. A CMS whose sections are only named leaves
 * an editor guessing which of two similar screens owns a piece of copy, and this panel has
 * several — Lists and the records the lists belong to, Pages and the collections their
 * sections render. The sentence under the heading is where that is settled.
 *
 * The account control signs out, and that is all it does. One shared login means there is
 * no account to switch to.
 */
export function AdminScreen({ breadcrumb, heading, description, children }: AdminScreenProps) {
  return (
    <div className="px-10 py-7">
      <div className="flex items-center justify-between gap-6">
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="text-small flex flex-wrap items-center gap-2 text-ink-40">
            {breadcrumb.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors duration-[180ms] hover:text-ink"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-graphite-70">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <AccountMenu />
      </div>

      <header className="mt-10 max-w-[70ch]">
        <h1 className="text-display-s text-ink">{heading}</h1>
        <p className="text-small mt-3 text-graphite-70">{description}</p>
      </header>

      <hr className="mt-8 border-0 border-t border-hairline" />

      <div className="mt-8 pb-16">{children}</div>
    </div>
  );
}
