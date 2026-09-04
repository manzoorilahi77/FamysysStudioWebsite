import type { ReactNode } from "react";

interface AdminPanelProps {
  /** The header row's left-hand label — what the rows below are. */
  readonly label: string;
  /** Its right-hand figure. A count, or a size, or nothing. */
  readonly meta?: string;
  readonly children: ReactNode;
}

/**
 * The bordered panel every list sits in: a header row over rows separated by hairlines.
 * Flat — one border, one radius token, no shadow — because a shadow here would be the
 * only depth cue anywhere in the product, on its least important surface.
 */
export function AdminPanel({ label, meta, children }: AdminPanelProps) {
  return (
    <section className="overflow-hidden rounded-sm border border-ink-12 bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-3">
        <p className="label text-ink-60">{label}</p>
        {meta ? <p className="text-small tabular text-ink-40">{meta}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** Shown in place of rows when a collection has nothing in it. */
export function AdminPanelEmpty({ message }: { readonly message: string }) {
  return <p className="text-small px-5 py-8 text-graphite-70">{message}</p>;
}
