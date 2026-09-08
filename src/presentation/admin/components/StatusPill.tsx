import type { CmsStatus } from "../../../domain/cms/entities/CmsRecord";

const LABEL: Record<CmsStatus, string> = {
  published: "Published",
  draft: "Unpublished edits",
};

const TONE: Record<CmsStatus, string> = {
  published: "border-ink-12 bg-ink-4 text-ink-60",
  draft: "border-accent bg-accent-8 text-accent",
};

/**
 * Which of the two states a section is in: everything on it is live, or something on it has
 * been saved and not published yet.
 *
 * The draft pill is the loud one on purpose. "Published" is the resting state and should not
 * catch the eye; "Unpublished edits" is a thing somebody has to finish.
 */
export function StatusPill({ status }: { readonly status: CmsStatus }) {
  return (
    <span className={`label shrink-0 rounded-sm border px-2 py-1 ${TONE[status]}`}>
      {LABEL[status]}
    </span>
  );
}
