import type { CmsValue } from "../../../domain/cms/entities/CmsRecord";

/**
 * One string, and everything an editor needs to know before changing it: whose words they
 * are, where else they appear, and — when it cannot be changed here — why not.
 *
 * The three annotations are the reason this is not a plain labelled input. A CMS that
 * shows only the field lets someone rewrite the client's own headline believing it is
 * placeholder copy, and lets them change a sentence that six other pages also print
 * without ever seeing the other six.
 */

/** Above this many characters a value gets a textarea rather than a single-line input. */
const MULTILINE_THRESHOLD = 60;
/** How many other locations to name before summarising the rest. */
const USAGE_SHOWN = 3;

const CONTROL =
  "text-small w-full rounded-sm border px-3 py-2 transition-colors duration-[180ms] focus:border-ink-40";
const EDITABLE = "border-ink-12 bg-card text-ink";
const LOCKED = "border-ink-12 bg-canvas text-graphite-70 disabled:cursor-default";

function ApprovalChip({ value }: { readonly value: CmsValue }) {
  return value.approval === "client" ? (
    <span className="label rounded-sm bg-accent-8 px-2 py-1 text-accent">Client copy</span>
  ) : (
    <span className="label rounded-sm bg-ink-4 px-2 py-1 text-ink-60">Draft</span>
  );
}

function usageLine(value: CmsValue): string {
  const shown = value.usedElsewhere.slice(0, USAGE_SHOWN).join(", ");
  const rest = value.usedElsewhere.length - USAGE_SHOWN;
  return rest > 0 ? `${shown}, and ${rest} more` : shown;
}

interface ValueFieldProps {
  readonly value: CmsValue;
  readonly draft: string;
  readonly error: string | undefined;
  readonly isDirty: boolean;
  readonly onChange: (next: string) => void;
}

export function ValueField({ value, draft, error, isDirty, onChange }: ValueFieldProps) {
  const id = `value-${value.id}`;
  const describedBy = [
    error ? `${id}-error` : null,
    value.readOnlyReason ? `${id}-locked` : null,
    value.usedElsewhere.length > 0 ? `${id}-usage` : null,
  ]
    .filter((entry) => entry !== null)
    .join(" ");

  // Decided from the STORED value, not the draft, so a field does not turn into a
  // textarea under the cursor as someone types past sixty characters.
  const multiline = value.value.length > MULTILINE_THRESHOLD;
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
        <ApprovalChip value={value} />
        {isDirty ? <span className="text-small text-accent">Unsaved</span> : null}
      </div>

      <div className="mt-2">
        {multiline ? (
          <textarea {...common} rows={Math.min(8, Math.ceil(draft.length / 90) + 1)} />
        ) : (
          <input {...common} type="text" />
        )}
      </div>

      {locked ? (
        <p id={`${id}-locked`} className="text-small mt-2 text-graphite-70">
          {value.readOnlyReason}
        </p>
      ) : null}

      {isDirty && value.approval === "client" ? (
        <p className="text-small mt-2 text-accent">
          This is the client&rsquo;s own copy, taken verbatim from their brief. Changes here are
          changes to approved content — the brief is the source, not this panel.
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
