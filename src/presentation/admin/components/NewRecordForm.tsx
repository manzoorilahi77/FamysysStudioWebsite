"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * ADDING A RECORD, WITH THE TWO FIELDS THAT DECIDE WHETHER IT READS AS ANYTHING.
 *
 * A title and the line under it, and nothing else. The rest of a record — its expanded
 * copy, its lists, its alt text — is created empty and filled in on the record's own
 * screen, because a create form with fifteen fields is a form people abandon halfway and
 * a record half-filled from a modal is indistinguishable from one someone finished.
 *
 * Collapsed until asked for. A collection screen is a list, and a permanently open form
 * above it makes adding look like the main thing to do there when it is the rare thing.
 */
export function NewRecordForm({
  collectionId,
  noun,
}: {
  readonly collectionId: string;
  readonly noun: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);

    const response = await fetch("/admin/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ collectionId, title, summary }),
    }).catch(() => null);

    const result = (await response?.json().catch(() => null)) as
      { ok: true; recordId: string } | { ok: false; message: string } | null;

    if (!result) {
      setError("The server did not answer.");
      setSaving(false);
      return;
    }
    if (!result.ok) {
      setError(result.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setSummary("");
    setOpen(false);
    setSaving(false);
    router.push(`/admin/${collectionId}/${result.recordId}`);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-small mt-4 rounded-sm border border-ink-12 bg-card px-4 py-2 text-ink transition-colors duration-[180ms] hover:bg-ink-4"
      >
        Add {noun}
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-sm border border-ink-12 bg-card px-5 py-5"
      aria-label={`Add ${noun}`}
    >
      <label htmlFor="new-record-title" className="label block pb-2 text-ink-60">
        Title
      </label>
      <input
        id="new-record-title"
        value={title}
        autoFocus
        onChange={(event) => setTitle(event.target.value)}
        className="text-small w-full rounded-sm border border-hairline bg-canvas px-3 py-2 text-ink outline-none focus:border-ink-40"
      />

      <label htmlFor="new-record-summary" className="label mt-4 block pb-2 text-ink-60">
        The line under it
      </label>
      <textarea
        id="new-record-summary"
        rows={2}
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
        className="text-small w-full resize-none rounded-sm border border-hairline bg-canvas px-3 py-2 text-ink outline-none focus:border-ink-40"
      />

      <p className="text-small mt-3 text-ink-40">
        Everything else starts empty and is filled in on the record&rsquo;s own screen. The key it
        is stored under comes from the title and cannot be changed afterwards.
      </p>

      {error ? (
        <p role="alert" className="text-small mt-3 text-graphite-70">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || title.trim() === "" || summary.trim() === ""}
          className="text-small rounded-sm bg-ink px-4 py-2 text-canvas transition-colors duration-[180ms] disabled:cursor-default disabled:bg-ink-40"
        >
          {saving ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-small text-graphite-70 transition-colors duration-[180ms] hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
