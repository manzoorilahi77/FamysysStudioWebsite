"use client";

import { useEffect, useState } from "react";
import type { CmsInquiry, CmsInquiryStatus } from "../../../domain/cms/entities/CmsInquiry";
import { AdminPanel, AdminPanelEmpty } from "../components/AdminPanel";
import { AdminScreen } from "../components/AdminScreen";
import { InquiryActions } from "../components/InquiryActions";
import { InquiryDetailDialog } from "../components/InquiryDetailDialog";
import { relativeTime } from "../lib/relativeTime";

/**
 * THE ENQUIRIES, NEWEST FIRST, FILTERABLE, WITH FULL DETAIL BEHIND A MODAL RATHER THAN
 * INLINE.
 *
 * The list used to print every field on the row itself, which is generous with the client's
 * leads and unusable the moment there are more than a handful — nothing to scan, one long
 * page of prose. A row now shows what a scan needs (who, from where, a one-line preview of
 * what they are asking about, when, and its status) and a click opens the rest in
 * `InquiryDetailDialog`, which is where "considered" actually lives: full field list,
 * generous spacing, room to read.
 *
 * ARCHIVED ENQUIRIES ARE KEPT, NEVER DELETED. There is no delete: an enquiry is the one row
 * on this site that cannot be produced again from a content file. See `InquiryActions`.
 */

const DESCRIPTION =
  "Contact form submissions, newest first. Both forms write here — the homepage's closing form and /contact.";

const NO_SUBMISSIONS = "No submissions yet. This list is live, so an empty week is a quiet week.";
const NO_MATCHES = "Nothing matches these filters.";

const NOT_EMAILED =
  "Nothing is emailed anywhere. Mail is switched off on this server (MAIL_ENABLED), so an enquiry is stored here and nowhere else — no notification is sent to the studio, to a shared inbox or to a CRM. This list is the only place a submission appears, so it has to be checked.";

const EMAILED =
  "Each enquiry is also emailed to the studio, with Reply-To set to the sender, and the sender gets an acknowledgement. This list is still the record: an enquiry whose email failed is here all the same.";

type StatusFilter = "all" | CmsInquiryStatus;
type RangeFilter = "all" | "24h" | "7d" | "30d";

const STATUS_FILTERS: ReadonlyArray<{ readonly key: StatusFilter; readonly label: string }> = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
];

const RANGE_FILTERS: ReadonlyArray<{ readonly key: RangeFilter; readonly label: string }> = [
  { key: "all", label: "Any time" },
  { key: "24h", label: "24 hours" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
];

const RANGE_MS: Readonly<Record<Exclude<RangeFilter, "all">, number>> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

function withinRange(inquiry: CmsInquiry, range: RangeFilter, now: number): boolean {
  return range === "all" ? true : now - inquiry.receivedAt.getTime() <= RANGE_MS[range];
}

const STATUS_PILL: Readonly<Record<CmsInquiryStatus, { readonly label: string; readonly className: string }>> = {
  new: { label: "New", className: "bg-accent-8 text-accent" },
  read: { label: "Read", className: "bg-ink-4 text-ink-60" },
  archived: { label: "Archived", className: "bg-ink-4 text-graphite-70" },
};

/** Announced as well as drawn, the same rule `AdminSidebar`'s DraftDot follows. */
function UnreadDot() {
  return (
    <span
      className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent align-middle"
      role="img"
      aria-label="Unread"
    />
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  readonly active: boolean;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`label rounded-sm px-3 py-1.5 transition-colors duration-[180ms] ${
        active ? "bg-ink text-canvas" : "border border-ink-12 text-ink-60 hover:bg-ink-4"
      }`}
    >
      {children}
    </button>
  );
}

function Row({ inquiry, onOpen }: { readonly inquiry: CmsInquiry; readonly onOpen: () => void }) {
  const unread = inquiry.status === "new";
  const pill = STATUS_PILL[inquiry.status];
  const preview = inquiry.projectBrief?.trim() || "No project brief given.";

  return (
    // The id the notification email's own button links to: /admin/inbox#inquiry-<id>.
    // `InboxScreen` reads the hash on mount and opens this row's detail straight away —
    // the anchor still exists so a link to it never lands on nothing even if that fails.
    <li id={`inquiry-${inquiry.id}`} className={inquiry.status === "archived" ? "opacity-60" : undefined}>
      <div className="flex items-center gap-4 px-5 py-3">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`text-small truncate ${unread ? "font-medium text-ink" : "text-ink"}`}>
              {inquiry.name}
            </span>
            {unread ? <UnreadDot /> : null}
            <span className="text-small truncate text-graphite-70">{inquiry.companyName}</span>
          </span>
          <p className="text-small mt-1 truncate text-graphite-70">{preview}</p>
        </button>

        <span className={`label shrink-0 rounded-sm px-2 py-1 ${pill.className}`}>{pill.label}</span>

        <time
          dateTime={inquiry.receivedAt.toISOString()}
          title={inquiry.receivedAt.toISOString()}
          className="text-small tabular hidden w-20 shrink-0 text-right text-ink-40 sm:block"
        >
          {relativeTime(inquiry.receivedAt)}
        </time>

        <div className="shrink-0">
          <InquiryActions id={inquiry.id} status={inquiry.status} />
        </div>
      </div>
    </li>
  );
}

export function InboxScreen({
  inquiries,
  isMailEnabled = false,
}: {
  readonly inquiries: ReadonlyArray<CmsInquiry>;
  readonly isMailEnabled?: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // A notification email links to #inquiry-<id> — see the anchor on each row below. Opening
  // straight into that enquiry's detail is what the link is actually for; the anchor is
  // the fallback for a browser with JavaScript disabled or slow to hydrate.
  useEffect(() => {
    const match = /^#inquiry-(.+)$/.exec(window.location.hash);
    if (match?.[1]) setSelectedId(match[1]);
  }, []);

  const now = Date.now();
  const filtered = inquiries.filter(
    (inquiry) =>
      (statusFilter === "all" || inquiry.status === statusFilter) &&
      withinRange(inquiry, rangeFilter, now),
  );
  const unreadTotal = inquiries.filter((inquiry) => inquiry.status === "new").length;
  const selected = selectedId ? (inquiries.find((inquiry) => inquiry.id === selectedId) ?? null) : null;

  return (
    <AdminScreen breadcrumb={[{ label: "Inbox" }]} heading="Inbox" description={DESCRIPTION}>
      {isMailEnabled ? (
        <p className="text-small mb-6 max-w-[70ch] rounded-sm bg-ink-4 px-5 py-4 text-ink">{EMAILED}</p>
      ) : (
        <p className="text-small mb-6 max-w-[70ch] rounded-sm border border-accent bg-accent-8 px-5 py-4 text-ink">
          {NOT_EMAILED}
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((entry) => (
          <FilterButton
            key={entry.key}
            active={statusFilter === entry.key}
            onClick={() => setStatusFilter(entry.key)}
          >
            {entry.label}
          </FilterButton>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-hairline sm:block" aria-hidden="true" />
        {RANGE_FILTERS.map((entry) => (
          <FilterButton
            key={entry.key}
            active={rangeFilter === entry.key}
            onClick={() => setRangeFilter(entry.key)}
          >
            {entry.label}
          </FilterButton>
        ))}
      </div>

      <AdminPanel
        label="Enquiries"
        meta={unreadTotal > 0 ? `${unreadTotal} unread · ${filtered.length} shown` : `${filtered.length} shown`}
      >
        {filtered.length === 0 ? (
          <AdminPanelEmpty message={inquiries.length === 0 ? NO_SUBMISSIONS : NO_MATCHES} />
        ) : (
          <ul className="divide-y divide-hairline">
            {filtered.map((inquiry) => (
              <Row key={inquiry.id} inquiry={inquiry} onOpen={() => setSelectedId(inquiry.id)} />
            ))}
          </ul>
        )}
      </AdminPanel>

      {selected ? (
        <InquiryDetailDialog inquiry={selected} onClosed={() => setSelectedId(null)} />
      ) : null}
    </AdminScreen>
  );
}
