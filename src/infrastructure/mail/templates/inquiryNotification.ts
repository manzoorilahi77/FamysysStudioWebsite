import { SITE_NAME, SITE_URL } from "../../../shared/site/site";
import {
  SANS,
  SERIF,
  button,
  emailDocument,
  esc,
  greetingName,
  linkOrText,
  multiline,
  oneLine,
  palette,
  sectionLabel,
} from "./html";

/**
 * THE MESSAGE TO THE STUDIO. Read in a hurry and replied to from the inbox it lands in.
 *
 * The Reply-To — the submitter's address — is set by the mailer, not here, and it is the
 * single most important property of the message: Reply must answer the person, not the
 * shared inbox. This builds what they read: who and from where in the subject; the name,
 * the role/company/size band and two actions on the dark band above the fold; the brief in
 * the sender's own words; a small table of details.
 *
 * OPTIONAL FIELDS ARE OMITTED, NEVER PRINTED AS A PLACEHOLDER. Only the email is required;
 * a band reading "— · — · —" tells the reader nothing and looks like a fault.
 */

/** Past this the brief is cut, with a note saying where the whole of it is. */
export const BRIEF_PREVIEW_LENGTH = 4000;
const PREHEADER_LENGTH = 110;
const REPLY_SUBJECT = `Re: Your enquiry to ${SITE_NAME}`;
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export interface InquiryMailContent {
  readonly email: string;
  readonly fullName?: string | undefined;
  readonly companyName?: string | undefined;
  readonly companySize?: string | undefined;
  readonly companyWebsite?: string | undefined;
  readonly role?: string | undefined;
  readonly brief?: string | undefined;
  readonly receivedAt: Date;
}

export interface RenderedMail {
  readonly subject: string;
  readonly html: string;
}

export interface NotificationOptions {
  /** The enquiry in the admin inbox: /admin/inbox#inquiry-<id>. */
  readonly adminUrl: string;
  /** `cid:…` when the wordmark travels with the message; absent for the text wordmark. */
  readonly logoSrc?: string | undefined;
}

function present(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== "";
}

/** `New inquiry — Jane Doe, Acme` or `New inquiry — Jane Doe`; never a dangling comma. */
export function notificationSubject(inquiry: InquiryMailContent): string {
  const who = present(inquiry.fullName) ? inquiry.fullName : inquiry.email;
  const where = present(inquiry.companyName) ? `, ${inquiry.companyName}` : "";
  return oneLine(`New inquiry — ${who}${where}`);
}

/** Role, company and size, empties filtered out BEFORE joining, so none leaves a gap. */
export function roleLine(inquiry: InquiryMailContent): string {
  return [inquiry.role, inquiry.companyName, inquiry.companySize]
    .filter(present)
    .map((value) => value.trim())
    .join(" · ");
}

const RECEIVED_FORMAT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

/** `Thu 10 Sept 2026, 11:42 UTC` — the studio works across time zones, so it says which. */
export function receivedLabel(date: Date): string {
  return `${RECEIVED_FORMAT.format(date)} UTC`;
}

function heroRows(inquiry: InquiryMailContent, adminUrl: string): string {
  const hasName = present(inquiry.fullName);
  const name = present(inquiry.fullName) ? inquiry.fullName.trim() : inquiry.email;
  const first = greetingName(inquiry.fullName);
  const band = roleLine(inquiry);
  const mailto = `mailto:${inquiry.email}?subject=${encodeURIComponent(REPLY_SUBJECT)}`;

  return [
    `<tr><td style="padding:40px 0 12px;font-family:${SANS};font-size:12px;line-height:16px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${palette.gold};">From the contact form</td></tr>`,
    `<tr><td class="hero-title" style="padding:0 0 10px;font-family:${SERIF};font-size:40px;line-height:46px;color:${palette.onBand};word-break:break-word;">${esc(name)}</td></tr>`,
    band
      ? `<tr><td style="padding:0 0 4px;font-family:${SANS};font-size:16px;line-height:24px;color:${palette.onBandMuted};">${esc(band)}</td></tr>`
      : "",
    hasName
      ? `<tr><td style="padding:0;font-family:${SANS};font-size:15px;line-height:24px;"><a href="mailto:${esc(inquiry.email)}" style="color:${palette.onBand};text-decoration:underline;">${esc(inquiry.email)}</a></td></tr>`
      : "",
    `<tr><td style="padding:28px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td class="stack" valign="top">${button(first ? `Reply to ${first}` : "Reply to the sender", mailto, "primary")}</td>
                <td class="stack stack-gap" valign="top" style="padding-left:12px;">${button("Open in the admin inbox", adminUrl, "outline")}</td>
              </tr></table>
            </td></tr>`,
  ]
    .filter(Boolean)
    .join("\n");
}

function briefRows(brief: string | undefined): string {
  if (!present(brief)) {
    return `<tr><td class="muted" style="padding:0;font-family:${SERIF};font-size:18px;line-height:28px;font-style:italic;color:${palette.muted};">No brief was written — only an address to reply to.</td></tr>`;
  }
  const truncated = brief.length > BRIEF_PREVIEW_LENGTH;
  const text = truncated ? `${brief.slice(0, BRIEF_PREVIEW_LENGTH)}…` : brief;
  const note = truncated
    ? `<tr><td class="muted" style="padding:12px 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:${palette.muted};">The brief is longer than this — the full text is in the admin inbox.</td></tr>`
    : "";
  return `<tr><td class="ink" style="padding:0;font-family:${SERIF};font-size:19px;line-height:31px;color:${palette.ink};">${multiline(text)}</td></tr>${note}`;
}

function factRow(label: string, value: string): string {
  return `<tr>
                  <td class="rule muted" style="border-top:1px solid ${palette.rule};padding:12px 16px 12px 0;width:104px;vertical-align:top;font-family:${SANS};font-size:13px;line-height:20px;color:${palette.muted};">${label}</td>
                  <td class="rule ink" style="border-top:1px solid ${palette.rule};padding:12px 0;vertical-align:top;font-family:${SANS};font-size:14px;line-height:20px;color:${palette.ink};word-break:break-word;">${value}</td>
                </tr>`;
}

function detailRows(inquiry: InquiryMailContent): string {
  const linkStyle = `color:${palette.accent};text-decoration:underline;`;
  const facts = [
    factRow(
      "Email",
      `<a class="accent-text" href="mailto:${esc(inquiry.email)}" style="${linkStyle}">${esc(inquiry.email)}</a>`,
    ),
    ...(present(inquiry.companyWebsite)
      ? [factRow("Website", linkOrText(inquiry.companyWebsite.trim(), linkStyle))]
      : []),
    factRow("Received", esc(receivedLabel(inquiry.receivedAt))),
  ].join("\n");

  return `${sectionLabel("Details", 36)}
              <tr><td>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${facts}
                </table>
              </td></tr>`;
}

function replyNote(inquiry: InquiryMailContent): string {
  const first = greetingName(inquiry.fullName);
  return `<tr><td style="padding:28px 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td class="panel ink" style="background:${palette.panel};padding:18px 20px;border-radius:3px;font-family:${SANS};font-size:14px;line-height:22px;color:${palette.ink};">
                    <strong>Reply goes straight to ${first ? esc(first) : "the sender"}.</strong> Reply-To is set to ${esc(inquiry.email)}, so answering this email answers them, not the shared inbox. They were sent an automatic acknowledgement at the same time, so yours will be the first personal reply.
                  </td>
                </tr></table>
              </td></tr>`;
}

function preheader(inquiry: InquiryMailContent): string {
  if (!present(inquiry.brief)) return "Someone wrote in through the studio contact form.";
  const line = oneLine(inquiry.brief);
  return line.length > PREHEADER_LENGTH ? `${line.slice(0, PREHEADER_LENGTH)}…` : line;
}

export function inquiryNotification(
  inquiry: InquiryMailContent,
  options: NotificationOptions,
): RenderedMail {
  const subject = notificationSubject(inquiry);
  const content = [
    sectionLabel("The brief"),
    briefRows(inquiry.brief),
    detailRows(inquiry),
    replyNote(inquiry),
  ].join("\n");

  return {
    subject,
    html: emailDocument({
      preheader: preheader(inquiry),
      title: subject,
      logoSrc: options.logoSrc,
      badge: "New inquiry",
      hero: heroRows(inquiry, options.adminUrl),
      content,
      footer: `Sent by the contact form at ${esc(SITE_HOST)}. The enquiry is also stored in the admin inbox, whether or not this email arrived.`,
    }),
  };
}
