import { SITE_NAME, SITE_URL } from "../../../shared/site/site";
import {
  SANS,
  SERIF,
  emailDocument,
  esc,
  greetingName,
  palette,
  sectionLabel,
} from "./html";
import type { RenderedMail } from "./inquiryNotification";

/**
 * THE MESSAGE TO THE PERSON WHO WROTE IN.
 *
 * Sent from the shared mailbox with NO Reply-To: a reply already lands in the right place,
 * and setting one could only send it somewhere else.
 *
 * IT STATES NO RESPONSE TIME. The contact page promises none — see the note beside its
 * confirmation copy — and an autoresponder must not commit the studio to something the
 * site has not. `templates.test.ts` asserts it stays that way.
 *
 * IT REPEATS ONE THING THE VISITOR TYPED: A FIRST NAME, AND ONLY WHEN IT IS ONE. The form is
 * anonymous, so this goes to whatever address was entered, and anything it echoes is text a
 * stranger chose, sent from the studio's domain. A greeting by name is worth that; the brief
 * is not, and neither is a "name" with spaces, digits or punctuation — see `greetingName`.
 *
 * "What happens next" is the contact page's own three steps, word for word, so the page and
 * the email cannot promise different things.
 */

export const NEXT_STEPS = [
  {
    numeral: "01",
    heading: "Someone who makes the work reads it",
    body: "Your brief goes to the person who would direct it, not a routing queue.",
  },
  {
    numeral: "02",
    heading: "A short call",
    body: "Enough to establish what you are making, who it is for, and whether this is work we should be taking on at all.",
  },
  {
    numeral: "03",
    heading: "A written approach",
    body: "If it fits, you get the approach we would take, the scope it implies and the production model that suits it — before any commitment.",
  },
] as const;

const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export interface AcknowledgementOptions {
  /** As typed; only its first word is used, and only when it is a plausible name. */
  readonly fullName?: string | undefined;
  readonly logoSrc?: string | undefined;
}

export function acknowledgementSubject(fullName?: string): string {
  const first = greetingName(fullName);
  return first
    ? `Thanks, ${first} — your brief is with ${SITE_NAME}`
    : `Your brief is with ${SITE_NAME}`;
}

function heroRows(first: string | undefined): string {
  return [
    `<tr><td style="padding:40px 0 12px;font-family:${SANS};font-size:12px;line-height:16px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${palette.gold};">Enquiry received</td></tr>`,
    `<tr><td class="hero-title" style="padding:0 0 14px;font-family:${SERIF};font-size:44px;line-height:50px;color:${palette.onBand};">${first ? `Thanks, ${esc(first)}.` : "Thank you for writing in."}</td></tr>`,
    `<tr><td style="padding:0;font-family:${SANS};font-size:17px;line-height:27px;color:${palette.onBandMuted};">Your brief is with us — and a person, not a queue, is reading it.</td></tr>`,
  ].join("\n");
}

function stepRow(step: (typeof NEXT_STEPS)[number], isLast: boolean): string {
  const bottom = isLast ? `border-bottom:1px solid ${palette.rule};` : "";
  return `<tr><td class="rule" style="border-top:1px solid ${palette.rule};${bottom}padding:18px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td class="accent-text" valign="top" width="52" style="width:52px;font-family:${SERIF};font-size:24px;line-height:26px;color:${palette.accent};">${step.numeral}</td>
                  <td valign="top">
                    <div class="ink" style="font-family:${SANS};font-size:16px;line-height:24px;font-weight:600;color:${palette.ink};">${esc(step.heading)}</div>
                    <div class="muted" style="padding-top:4px;font-family:${SANS};font-size:15px;line-height:23px;color:${palette.muted};">${esc(step.body)}</div>
                  </td>
                </tr></table>
              </td></tr>`;
}

function contentRows(): string {
  const paragraph = `<tr><td class="ink" style="padding:0;font-family:${SANS};font-size:16px;line-height:27px;color:${palette.ink};">We read every enquiry ourselves. Yours goes straight to the person who would direct the work, so the first reply you get will come from someone who can actually talk about it.</td></tr>`;

  const steps = NEXT_STEPS.map((step, index) => stepRow(step, index === NEXT_STEPS.length - 1));

  const addMore = `<tr><td style="padding:28px 0 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                  <td class="panel ink" style="background:${palette.panel};padding:20px 22px;border-radius:3px;font-family:${SANS};font-size:15px;line-height:24px;color:${palette.ink};">
                    <strong>Something to add?</strong> A reference, a deadline, a link to work you admire — reply to this email and it joins the same conversation.
                  </td>
                </tr></table>
              </td></tr>`;

  const signOff = `<tr><td class="ink" style="padding:32px 0 0;font-family:${SERIF};font-size:18px;line-height:28px;color:${palette.ink};">With thanks,<br>The ${esc(SITE_NAME)} team</td></tr>`;

  return [paragraph, sectionLabel("What happens next", 32), ...steps, addMore, signOff].join("\n");
}

export function inquiryAcknowledgement(options: AcknowledgementOptions = {}): RenderedMail {
  const first = greetingName(options.fullName);
  const subject = acknowledgementSubject(options.fullName);
  return {
    subject,
    html: emailDocument({
      preheader: "Your brief reached the studio. Here is what happens next.",
      title: subject,
      logoSrc: options.logoSrc,
      hero: heroRows(first),
      content: contentRows(),
      footer: `${esc(SITE_NAME)} · <a href="${esc(SITE_URL)}" style="color:${palette.muted};">${esc(SITE_HOST)}</a><br>You are receiving this because this address was entered in the contact form at ${esc(SITE_HOST)}. If that wasn't you, ignore this email — nothing more will be sent.`,
    }),
  };
}
