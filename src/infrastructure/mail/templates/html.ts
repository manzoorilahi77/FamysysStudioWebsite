import { mix } from "../../../shared/design/colorMath";
import { colors } from "../../../shared/design/colors";
import { SITE_NAME } from "../../../shared/site/site";

/**
 * EMAIL HTML, WHICH IS NOT WEB HTML.
 *
 * Written for Outlook on Windows, whose rendering engine is Word's. No flexbox, no grid, no
 * custom properties, no `position`, no viewport units, no stylesheet for layout: nested
 * tables with fixed pixel widths and inline styles. 600px is the card width because
 * Outlook's reading pane and a phone in portrait both cope with it and nothing wider
 * survives either.
 *
 * The `<style>` block carries only what degrades rather than breaks when it is ignored:
 * dark-mode overrides (with Outlook.com's `[data-ogsc]` twins) and phone-width stacking.
 * No web fonts — Outlook does not load them — so the site's serif display face is echoed
 * by Georgia, which every client has, and the body is the platform's own sans. No remote
 * images: the one image, the wordmark, travels inside the message as a `cid:` attachment.
 *
 * THE PALETTE IS THE SITE'S. Every colour here is one of colors.ts's twelve or a mix of
 * two of them, so a palette change reaches the mail too. Gold appears only on the dark band,
 * where it clears contrast; on the light card the accent is the claret.
 */

export const SANS =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif";
export const SERIF = "Georgia, 'Times New Roman', Times, serif";

export const palette = {
  page: colors.pageBackground,
  card: colors.cardBackground,
  ink: colors.textOnLight,
  muted: mix(colors.textOnLight, colors.cardBackground, 0.32),
  rule: colors.sectionWarm,
  panel: mix(colors.sectionWarm, colors.cardBackground, 0.45),
  band: colors.darkBackground,
  onBand: colors.textOnDark,
  onBandMuted: mix(colors.textOnDark, colors.darkBackground, 0.32),
  bandRule: mix(colors.textOnDark, colors.darkBackground, 0.82),
  accent: colors.accentPrimary,
  accentOnDark: colors.accentOnDark,
  gold: colors.accentWarm,
  darkCard: mix(colors.darkBackground, colors.textOnDark, 0.05),
  darkPanel: colors.sectionAlt,
} as const;

const ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Everything a stranger typed passes through here before it is interpolated. */
export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character);
}

/**
 * Escaped, then line breaks turned into `<br>`. In that order, so the tag added here is
 * the only markup in the result.
 */
export function multiline(value: string): string {
  return esc(value).replace(/\r\n|\r|\n/g, "<br>");
}

/**
 * A URL a reader may click, or undefined when it must be printed as text.
 *
 * Escaping is not enough for a link. It stops a value breaking OUT of the attribute and
 * does nothing about one that is dangerous INSIDE it: `javascript:alert(1)` survives
 * escaping intact, and the person clicking it is a member of staff. So the value is parsed
 * and only http and https come back. A bare host is retried under https://, because that is
 * what most people type. This runs in the template, not only in the validator, so it holds
 * for whatever is already in the database.
 */
export function safeHref(raw: string): string | undefined {
  const value = raw.trim();
  if (value === "") return undefined;
  for (const candidate of [value, `https://${value}`]) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") {
        // A host with no dot is what `https://javascript:alert(1)` parses to, among others.
        return url.hostname.includes(".") ? url.href : undefined;
      }
    } catch {
      // Not a URL in this form; try the next.
    }
  }
  return undefined;
}

/** A value rendered as a link when it is a safe one, and as plain text otherwise. */
export function linkOrText(raw: string, style: string): string {
  const href = safeHref(raw);
  return href
    ? `<a href="${esc(href)}" style="${style}" target="_blank" rel="noopener noreferrer">${esc(raw)}</a>`
    : esc(raw);
}

/** Collapses a line to one line of plain text, for a subject or a preheader. */
export function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * The first word of a name, fit to greet someone with — or undefined.
 *
 * ONLY LETTERS, APOSTROPHES AND HYPHENS, AND ONLY ONE WORD. The acknowledgement goes to
 * whatever address was typed into an anonymous form, so anything it echoes is text a
 * stranger chose, sent from the studio's domain. A first name is worth that — "Thanks,
 * Shafwan." reads as a person, not an autoresponder — but nothing longer is: no spaces,
 * no digits, no punctuation that could carry a link or a sentence.
 */
export { greetingName } from "../../../shared/text/greetingName";

/** A button that survives Outlook: a padded table cell, never a styled `<a>` alone. */
export function button(
  label: string,
  href: string,
  variant: "primary" | "outline",
): string {
  const cell =
    variant === "primary"
      ? `background:${palette.accent};border:1px solid ${palette.accent};`
      : `border:1px solid ${palette.onBandMuted};`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="${cell}border-radius:3px;">
  <a href="${esc(href)}" style="display:inline-block;padding:13px 22px;font-family:${SANS};font-size:14px;line-height:18px;font-weight:600;color:${palette.onBand};text-decoration:none;">${esc(label)}</a>
</td></tr></table>`;
}

/** A small uppercase label above a section of the card. */
export function sectionLabel(text: string, paddingTop = 0): string {
  return `<tr><td class="muted" style="padding:${paddingTop}px 0 12px;font-family:${SANS};font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${palette.muted};">${esc(text)}</td></tr>`;
}

function wordmark(logoSrc: string | undefined): string {
  if (logoSrc) {
    return `<img src="${esc(logoSrc)}" width="159" height="48" alt="${esc(SITE_NAME)}" style="display:block;width:159px;height:48px;border:0;outline:none;text-decoration:none;font-family:${SANS};font-size:18px;font-weight:600;color:${palette.onBand};">`;
  }
  return `<span style="font-family:${SANS};font-size:22px;line-height:24px;font-weight:600;color:${palette.onBand};">Famysys</span><br><span style="font-family:${SANS};font-size:11px;line-height:16px;font-weight:600;letter-spacing:0.32em;color:${palette.gold};">STUDIO</span>`;
}

export interface EmailShell {
  /** The first text an inbox shows beside the subject, named rather than left to chance. */
  readonly preheader: string;
  readonly title: string;
  /** `cid:…` in a sent message, a data URI in a preview; absent for the text wordmark. */
  readonly logoSrc?: string | undefined;
  /** A short label opposite the wordmark, e.g. "New inquiry". */
  readonly badge?: string | undefined;
  /** Rows for the dark band beneath the wordmark, already escaped. */
  readonly hero: string;
  /** Rows for the light card, already escaped. */
  readonly content: string;
  readonly footer: string;
}

export function emailDocument(shell: EmailShell): string {
  const badge = shell.badge
    ? `<td align="right" valign="middle" style="font-family:${SANS};"><span style="display:inline-block;padding:6px 12px;border:1px solid ${palette.gold};border-radius:999px;font-size:11px;line-height:14px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${palette.gold};">${esc(shell.badge)}</span></td>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(shell.title)}</title>
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
  a { text-decoration-thickness: 1px; }
  @media (prefers-color-scheme: dark) {
    .page { background: ${palette.band} !important; }
    .card { background: ${palette.darkCard} !important; }
    .panel { background: ${palette.darkPanel} !important; }
    .ink, .ink a { color: ${palette.onBand} !important; }
    .muted, .muted a { color: ${palette.onBandMuted} !important; }
    .accent-text, .accent-text a { color: ${palette.accentOnDark} !important; }
    .rule { border-color: ${palette.bandRule} !important; }
  }
  [data-ogsc] .ink, [data-ogsc] .ink a { color: ${palette.onBand} !important; }
  [data-ogsc] .muted, [data-ogsc] .muted a { color: ${palette.onBandMuted} !important; }
  [data-ogsc] .accent-text { color: ${palette.accentOnDark} !important; }
  [data-ogsb] .card { background: ${palette.darkCard} !important; }
  [data-ogsb] .panel { background: ${palette.darkPanel} !important; }
  @media screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .pad { padding-left: 24px !important; padding-right: 24px !important; }
    .hero-title { font-size: 32px !important; line-height: 38px !important; }
    .stack { display: block !important; width: 100% !important; }
    .stack-gap { padding: 12px 0 0 0 !important; }
  }
</style>
</head>
<body class="page" style="margin:0;padding:0;background:${palette.page};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${palette.page};">${esc(shell.preheader)}</div>
<table role="presentation" class="page" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${palette.page};">
  <tr>
    <td align="center" style="padding:32px 12px 40px;">
      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
        <tr>
          <td class="pad" style="background:${palette.band};padding:32px 40px 40px;border-radius:4px 4px 0 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle">${wordmark(shell.logoSrc)}</td>
                ${badge}
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${shell.hero}
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:${palette.accent};height:4px;line-height:4px;font-size:4px;">&nbsp;</td>
        </tr>
        <tr>
          <td class="card pad" style="background:${palette.card};padding:36px 40px 40px;border-radius:0 0 4px 4px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${shell.content}
            </table>
          </td>
        </tr>
        <tr>
          <td class="pad muted" style="padding:24px 40px 0;font-family:${SANS};font-size:12px;line-height:19px;color:${palette.muted};">
            ${shell.footer}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
