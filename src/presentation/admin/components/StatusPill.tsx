import type { CmsStatus } from "../../../domain/cms/entities/CmsRecord";

const LABEL: Record<CmsStatus, string> = {
  draft: "Draft",
};

/**
 * Everything reads DRAFT in this phase, and will keep reading it until there is a publish
 * action to move a record on. Driven off `CmsStatus` rather than hardcoded so the day a
 * second state exists, the compiler finds this file.
 */
export function StatusPill({ status }: { readonly status: CmsStatus }) {
  return (
    <span className="label shrink-0 rounded-sm border border-ink-12 bg-ink-4 px-2 py-1 text-ink-60">
      {LABEL[status]}
    </span>
  );
}
