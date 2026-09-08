"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CmsInquiryStatus } from "../../../domain/cms/entities/CmsInquiry";

/**
 * MARK READ, ARCHIVE, AND PUT BACK. There is no delete.
 *
 * An enquiry is the one thing in this panel that cannot be regenerated: every other row
 * came from a content file and could be seeded again, and a lead came from a person who
 * took the trouble to write. Archiving takes it out of the inbox and keeps the row, and
 * archiving the wrong one is undone by putting it back.
 */
export function InquiryActions({
  id,
  status,
}: {
  readonly id: string;
  readonly status: CmsInquiryStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function set(next: CmsInquiryStatus) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/admin/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(result?.message ?? "That did not work. Try again.");
        return;
      }
      router.refresh();
    } catch {
      setError("The server did not answer.");
    } finally {
      setBusy(false);
    }
  }

  const link =
    "transition-colors duration-[180ms] hover:text-ink disabled:cursor-default disabled:text-ink-40";

  return (
    <div className="text-small flex shrink-0 flex-col items-end gap-1 text-graphite-70">
      <div className="flex items-center gap-4">
        {status === "new" ? (
          <button type="button" onClick={() => void set("read")} disabled={busy} className={link}>
            Mark read
          </button>
        ) : null}
        {status === "archived" ? (
          <button type="button" onClick={() => void set("read")} disabled={busy} className={link}>
            Put back in the inbox
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void set("archived")}
            disabled={busy}
            className={link}
          >
            Archive
          </button>
        )}
      </div>
      {error ? (
        <p role="alert" className="text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
