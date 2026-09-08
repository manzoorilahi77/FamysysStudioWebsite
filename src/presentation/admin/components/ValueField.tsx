import type { CmsValue } from "../../../domain/cms/entities/CmsRecord";

/**
 * One string, and everything an editor needs to know before changing it: whose words they
 * are, what the site is currently serving if this is a draft, where else the string
 * appears, and — when it cannot be changed here — why not.
 *
 * The annotations are the reason this is not a plain labelled input. A CMS that shows only
 * the field lets someone rewrite the client's own headline believing it is placeholder
 * copy, and lets them change a sentence that six other pages also print without ever seeing
 * the other six.
 */

/** How many other locations to name before summarising the rest. */
const USAGE_SHOWN = 3;

const CONTROL =
  "text-small w-full rounded-sm border px-3 py-2 transition-colors duration-[180ms] focus:border-ink-40 focus:outline-none";
const EDITABLE = "border-ink-12 bg-card text-ink";
const LOCKED = "border-ink-12 bg-canvas text-graphite-70 disabled:cursor-default";

/** Rows for a growing box: one per ~90 characters, between three and twelve. */
function rowsFor(text: string): number {
  return Math.min(12, Math.max(3, Math.ceil(text.length / 90) + 1));
}

function usageLine(value: CmsValue): string {
  const shown = value.usedElsewhere.slice(0, USAGE_SHOWN).join(", ");
  const rest = value.usedElsewhere.length - USAGE_SHOWN;
  return rest > 0 ? `${shown}, and ${rest} more` : shown;
}

interface ValueFieldProps {
  readonly value: CmsValue;
  /** What is in the box: the editor's typing, or the draft, or the published string. */
  readonly draft: string;
  readonly error: string | undefined;
  /** The box differs from what is saved. */
  readonly isChanged: boolean;
  readonly onChange: (next: string) => void;
}

export function ValueField({ value, draft, error, isChanged, onChange }: ValueFieldProps) {
  const id = `value-${value.id}-${value.label.replace(/\W+/g, "-")}`;
  const describedBy = [
    error ? `${id}-error` : null,
    value.readOnlyReason ? `${id}-locked` : null,
    value.draftValue !== undefined ? `${id}-live` : null,
    value.approval === "client" ? `${id}-approval` : null,
    value.usedElsewhere.length > 0 ? `${id}-usage` : null,
  ]
    .filter((entry) => entry !== null)
    .join(" ");

  const locked = !value.pointer;
  const common = {
    id,
    value: draft,
    disabled: locked,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
    className: `${CONTROL} ${locked ? LOCKED : EDITABLE} ${error ? "border-accent" : ""}`,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={id} className="label text-ink-60">
          {value.label}
        </label>
        {value.approval === "client" ? (
          <span className="label rounded-sm bg-accent-8 px-2 py-1 text-accent">Client copy</span>
        ) : (
          <span className="label rounded-sm bg-ink-4 px-2 py-1 text-ink-60">Drafted copy</span>
        )}
        {value.draftValue !== undefined ? (
          <span className="label rounded-sm border border-accent px-2 py-1 text-accent">
            Saved, not published
          </span>
        ) : null}
        {isChanged ? <span className="text-small text-accent">Unsaved</span> : null}
      </div>

      <div className="mt-2">
        {value.multiline ? (
          <textarea {...common} rows={rowsFor(draft)} />
        ) : (
          <input {...common} type="text" />
        )}
      </div>

      {locked ? (
        <p id={`${id}-locked`} className="text-small mt-2 text-graphite-70">
          Cannot be edited here. {value.readOnlyReason}
        </p>
      ) : null}

      {/* What the public site is serving right now, when that is not what is in the box.
          Without it "saved" and "live" are the same field and nobody can tell them apart. */}
      {value.draftValue !== undefined ? (
        <p id={`${id}-live`} className="text-small mt-2 text-ink-40">
          Live on the site: <span className="text-graphite-70">{value.value}</span>
        </p>
      ) : null}

      {value.approval === "client" && (isChanged || value.draftValue !== undefined) ? (
        <p id={`${id}-approval`} className="text-small mt-2 text-accent">
          This is the client&rsquo;s own copy, taken verbatim from their brief. Changing it is
          changing approved content — the brief is the source, not this panel.
        </p>
      ) : null}

      {value.usedElsewhere.length > 0 ? (
        <p id={`${id}-usage`} className="text-small mt-2 text-ink-40">
          The same string is also on: {usageLine(value)}.
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-small mt-2 text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
