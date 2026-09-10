import type { CmsInquiry } from "../../../domain/cms/entities/CmsInquiry";
import { AdminPanel, AdminPanelEmpty } from "../components/AdminPanel";
import { AdminScreen } from "../components/AdminScreen";
import { InquiryActions } from "../components/InquiryActions";
import { relativeTime } from "../lib/relativeTime";

/**
 * THE ENQUIRIES, NEWEST FIRST, WITH EVERY FIELD THE SENDER FILLED IN.
 *
 * Not a summary line. Someone who took the trouble to describe their project in the brief
 * box should not have that sit in a column nobody reads — so the whole submission is on the
 * screen, and the reply is an email to the address at the top of it.
 *
 * ARCHIVED ENQUIRIES ARE KEPT AND SHOWN SEPARATELY. There is no delete: an enquiry is the
 * one row on this site that cannot be produced again from a content file.
 */

const DESCRIPTION =
  "Contact form submissions, newest first. Both forms write here — the homepage's closing form and /contact.";

const EMPTY = "No submissions yet. This list is live, so an empty week is a quiet week.";

/**
 * What happens to an enquiry besides this list, said on the screen. With mail off the row
 * is written and that is all: somebody has to open this panel, and if nobody knows that, a
 * lead sits here unread. With mail on, this list is still the record — a notification that
 * failed leaves its enquiry here all the same.
 */
const NOT_EMAILED =
  "Nothing is emailed anywhere. Mail is switched off on this server (MAIL_ENABLED), so an enquiry is stored here and nowhere else — no notification is sent to the studio, to a shared inbox or to a CRM. This list is the only place a submission appears, so it has to be checked.";

const EMAILED =
  "Each enquiry is also emailed to the studio, with Reply-To set to the sender, and the sender gets an acknowledgement. This list is still the record: an enquiry whose email failed is here all the same.";

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="label text-ink-40">{label}</dt>
      <dd className="text-small mt-1 whitespace-pre-line break-words text-ink">{value}</dd>
    </div>
  );
}

function Enquiry({ inquiry }: { readonly inquiry: CmsInquiry }) {
  return (
    // The id is what the notification email's button links to: /admin/inbox#inquiry-<id>.
    <article id={`inquiry-${inquiry.id}`} className="scroll-mt-6 px-5 py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-small flex flex-wrap items-center gap-3 text-ink">
            {inquiry.name}
            {inquiry.status === "new" ? (
              <span className="label rounded-sm bg-accent-8 px-2 py-1 text-accent">New</span>
            ) : null}
            <span className="label rounded-sm bg-ink-4 px-2 py-1 text-ink-60">
              {inquiry.sourceForm === "home" ? "Homepage form" : "Contact page"}
            </span>
          </h2>
          <p className="text-small mt-1 text-graphite-70">
            <a href={`mailto:${inquiry.email}`} className="underline">
              {inquiry.email}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <InquiryActions id={inquiry.id} status={inquiry.status} />
          <time
            dateTime={inquiry.receivedAt.toISOString()}
            title={inquiry.receivedAt.toISOString()}
            className="text-small tabular w-24 text-right text-ink-40"
          >
            {relativeTime(inquiry.receivedAt)}
          </time>
        </div>
      </div>

      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Company" value={inquiry.companyName} />
        <Field label="Company size" value={inquiry.companySize} />
        {inquiry.companyWebsite !== null ? (
          <Field label="Website" value={inquiry.companyWebsite || "Left blank"} />
        ) : null}
        {inquiry.contactRole !== null ? (
          <Field label="Role" value={inquiry.contactRole || "Left blank"} />
        ) : null}
        {inquiry.projectBrief !== null ? (
          <div className="sm:col-span-2">
            <Field label="Project brief" value={inquiry.projectBrief || "Left blank"} />
          </div>
        ) : null}
      </dl>

      <p className="text-small mt-4 text-ink-40">
        Received {inquiry.receivedAt.toISOString().replace("T", " ").slice(0, 16)} UTC
        {inquiry.sourceForm === "home"
          ? " · the homepage form asks four questions, so the three fields above it does not ask for are absent rather than empty."
          : null}
      </p>
    </article>
  );
}

export function InboxScreen({
  inquiries,
  isMailEnabled = false,
}: {
  readonly inquiries: ReadonlyArray<CmsInquiry>;
  readonly isMailEnabled?: boolean;
}) {
  const open = inquiries.filter((inquiry) => inquiry.status !== "archived");
  const archived = inquiries.filter((inquiry) => inquiry.status === "archived");
  const unread = open.filter((inquiry) => inquiry.status === "new").length;

  return (
    <AdminScreen breadcrumb={[{ label: "Inbox" }]} heading="Inbox" description={DESCRIPTION}>
      {isMailEnabled ? (
        <p className="text-small mb-6 max-w-[70ch] rounded-sm bg-ink-4 px-5 py-4 text-ink">
          {EMAILED}
        </p>
      ) : (
        <p className="text-small mb-6 max-w-[70ch] rounded-sm border border-accent bg-accent-8 px-5 py-4 text-ink">
          {NOT_EMAILED}
        </p>
      )}

      <AdminPanel
        label="Enquiries"
        meta={unread > 0 ? `${unread} unread · ${open.length}` : `${open.length}`}
      >
        {open.length === 0 ? (
          <AdminPanelEmpty message={EMPTY} />
        ) : (
          <div className="divide-y divide-hairline">
            {open.map((inquiry) => (
              <Enquiry key={inquiry.id} inquiry={inquiry} />
            ))}
          </div>
        )}
      </AdminPanel>

      {archived.length > 0 ? (
        <div className="mt-8">
          <AdminPanel label="Archived" meta={`${archived.length}`}>
            <div className="divide-y divide-hairline">
              {archived.map((inquiry) => (
                <Enquiry key={inquiry.id} inquiry={inquiry} />
              ))}
            </div>
          </AdminPanel>
        </div>
      ) : null}
    </AdminScreen>
  );
}
