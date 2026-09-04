import type { CmsInquiry } from "../../../domain/cms/entities/CmsInquiry";
import { AdminPanel, AdminPanelEmpty } from "../components/AdminPanel";
import { AdminRowList } from "../components/AdminRow";
import { AdminScreen } from "../components/AdminScreen";
import { InquiryActions } from "../components/InquiryActions";
import { relativeTime } from "../lib/relativeTime";

const DESCRIPTION =
  "Contact form submissions, newest first. Both forms write here — the homepage's closing form and /contact — and archiving takes an enquiry out of this list without deleting it. There is no email forwarding yet, so this list is the only place a submission appears.";

const EMPTY = "No submissions yet. This list is live, so an empty week is a quiet week.";

/**
 * The one screen in the panel whose rows are not content.
 *
 * It does not reuse `AdminRow`: a row here carries an action rather than a link, and every
 * other row in the panel leads somewhere. Making the shared row grow a button for the sake
 * of one screen would put a button on the six that do not want one.
 *
 * There is nothing to click through to. An enquiry is a name, an address and a date, and
 * the reply is an email to the address — not something typed into a CMS.
 */
export function InquiriesScreen({ inquiries }: { readonly inquiries: ReadonlyArray<CmsInquiry> }) {
  const unread = inquiries.filter((inquiry) => inquiry.status === "new").length;

  return (
    <AdminScreen
      breadcrumb={[{ label: "Inbox" }, { label: "Inquiries" }]}
      heading="Inquiries"
      description={DESCRIPTION}
    >
      <AdminPanel
        label="All submissions"
        meta={unread > 0 ? `${unread} unread · ${inquiries.length}` : `${inquiries.length}`}
      >
        {inquiries.length === 0 ? (
          <AdminPanelEmpty message={EMPTY} />
        ) : (
          <AdminRowList>
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="flex items-center justify-between gap-6 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-small text-ink">
                    {inquiry.name}
                    {inquiry.status === "new" ? (
                      <span className="label ml-3 rounded-sm bg-accent-8 px-2 py-1 text-accent">
                        New
                      </span>
                    ) : null}
                  </p>
                  <p className="text-small mt-1 truncate text-graphite-70">
                    {inquiry.email} · {inquiry.companyName} · {inquiry.companySize}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-5">
                  <InquiryActions id={inquiry.id} status={inquiry.status} />
                  <span className="text-small tabular w-24 text-right text-ink-40">
                    {relativeTime(inquiry.receivedAt)}
                  </span>
                </div>
              </div>
            ))}
          </AdminRowList>
        )}
      </AdminPanel>
    </AdminScreen>
  );
}
