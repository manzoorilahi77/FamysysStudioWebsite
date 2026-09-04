"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * MARK READ, AND ARCHIVE. There is no delete.
 *
 * An enquiry is the one thing in this panel that cannot be regenerated: every other row
 * came from a content file and could be seeded again, and a lead came from a person who
 * took the trouble to write. Archiving takes it out of the inbox and keeps the row.
 */
export function InquiryActions({
  id,
  status,
}: {
  readonly id: string;
  readonly status: "new" | "read" | "archived";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function set(next: "read" | "archived") {
    setBusy(true);
    await fetch("/admin/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    }).catch(() => undefined);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="text-small flex shrink-0 items-center gap-4 text-graphite-70">
      {status === "new" ? (
        <button
          type="button"
          onClick={() => set("read")}
          disabled={busy}
          className="transition-colors duration-[180ms] hover:text-ink disabled:cursor-default"
        >
          Mark read
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => set("archived")}
        disabled={busy}
        className="transition-colors duration-[180ms] hover:text-ink disabled:cursor-default"
      >
        Archive
      </button>
    </div>
  );
}
