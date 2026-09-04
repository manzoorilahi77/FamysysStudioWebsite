import Link from "next/link";
import type { ReactNode } from "react";
import type { CmsStatus } from "../../../domain/cms/entities/CmsRecord";
import { relativeTime } from "../lib/relativeTime";
import { StatusPill } from "./StatusPill";

interface AdminRowProps {
  readonly title: string;
  readonly secondary: string;
  readonly status: CmsStatus;
  readonly updatedAt: Date | null;
  /** A row with no href is a record with nowhere further to go. */
  readonly href?: string;
}

function RowBody({ title, secondary, status, updatedAt }: Omit<AdminRowProps, "href">) {
  return (
    <>
      <div className="min-w-0">
        <p className="text-small text-ink">{title}</p>
        {/* Truncated to one line on purpose: the secondary line is a reminder of which
            record this is, and a row that grows to three lines stops being scannable. */}
        <p className="text-small mt-1 truncate text-graphite-70">{secondary}</p>
      </div>
      <div className="flex shrink-0 items-center gap-5">
        <StatusPill status={status} />
        <span className="text-small tabular w-24 text-right text-ink-40">
          {relativeTime(updatedAt)}
        </span>
      </div>
    </>
  );
}

/**
 * One row: what it is on the left, what state it is in and when it last moved on the
 * right. The hover fill is the only thing on the screen that moves, and only on rows that
 * lead somewhere.
 */
export function AdminRow({ href, ...body }: AdminRowProps) {
  const layout = "flex items-center justify-between gap-6 px-5 py-4";

  if (!href) {
    return (
      <div className={layout}>
        <RowBody {...body} />
      </div>
    );
  }

  return (
    <Link href={href} className={`${layout} transition-colors duration-[180ms] hover:bg-ink-4`}>
      <RowBody {...body} />
    </Link>
  );
}

/** Rows are separated by hairlines, never by gaps — the panel is one table, not cards. */
export function AdminRowList({ children }: { readonly children: ReactNode }) {
  return <div className="divide-y divide-hairline">{children}</div>;
}
