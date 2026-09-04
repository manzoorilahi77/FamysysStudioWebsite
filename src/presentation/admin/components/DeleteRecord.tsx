"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * REMOVING A RECORD, WHICH IS NOT REVERSIBLE AND SAYS SO.
 *
 * There is no bin and no undo — a deleted record's strings are gone with it. So the
 * confirmation is not a dialog with an OK button, which people click; it asks for the
 * record's title to be typed back. That is a deliberate speed bump, and it is the right
 * one here: it makes the destructive action require reading which record is about to go.
 *
 * It sits at the foot of the record's own screen rather than as an icon on a list row.
 * A delete control beside every row is a delete control next to the thing people are
 * trying to click on.
 */
export function DeleteRecord({
  collectionId,
  recordId,
  title,
}: {
  readonly collectionId: string;
  readonly recordId: string;
  readonly title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    setError(null);
    const response = await fetch("/admin/api/records", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ collectionId, recordId }),
    }).catch(() => null);

    const result = (await response?.json().catch(() => null)) as
      { ok: true } | { ok: false; message: string } | null;

    if (!result?.ok) {
      setError(result?.message ?? "The server did not answer.");
      setDeleting(false);
      return;
    }
    router.push(`/admin/${collectionId}`);
    router.refresh();
  }

  return (
    <div className="mt-12 border-t border-hairline pt-6">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-small text-graphite-70 transition-colors duration-[180ms] hover:text-ink"
        >
          Delete this record
        </button>
      ) : (
        <div>
          <p className="text-small text-ink">
            Deleting removes this record and every string on it. There is no undo.
          </p>
          <label htmlFor="delete-confirm" className="text-small mt-4 block text-graphite-70">
            Type <span className="text-ink">{title}</span> to confirm.
          </label>
          <input
            id="delete-confirm"
            value={typed}
            autoFocus
            onChange={(event) => setTyped(event.target.value)}
            className="text-small mt-2 w-full max-w-[28rem] rounded-sm border border-hairline bg-card px-3 py-2 text-ink outline-none focus:border-ink-40"
          />

          {error ? (
            <p role="alert" className="text-small mt-3 text-graphite-70">
              {error}
            </p>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={remove}
              disabled={deleting || typed.trim() !== title}
              className="text-small rounded-sm border border-ink-12 px-4 py-2 text-ink transition-colors duration-[180ms] hover:bg-ink-4 disabled:cursor-default disabled:text-ink-40"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTyped("");
                setError(null);
              }}
              className="text-small text-graphite-70 transition-colors duration-[180ms] hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
