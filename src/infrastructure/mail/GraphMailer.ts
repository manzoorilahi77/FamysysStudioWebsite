import { mailConfiguration } from "../db/env";

/**
 * OUTBOUND MAIL, THROUGH MICROSOFT GRAPH. Two responsibilities: get a token, send a message.
 *
 * WHY GRAPH AND NOT SMTP OR A MAIL SERVICE. famysys.com's mail is Exchange Online and its
 * SPF record ends in `-all`, so a third-party sender (SendGrid, Resend, a local sendmail)
 * is rejected outright rather than filed as spam. SMTP AUTH on smtp.office365.com is being
 * retired by Microsoft, needs Security Defaults off, cannot authenticate as a shared
 * mailbox and needs outbound port 587, which shared hosts block. Graph is OAuth2 client
 * credentials over 443: no mailbox password exists anywhere, and MFA does not affect it.
 *
 * `fetch` and two endpoints, no library. The site sends one shape of message — a subject,
 * a body, one recipient and an optional Reply-To — so there is nothing a mail library would
 * add but a dependency.
 *
 * NOTHING SECRET IS EVER LOGGED OR THROWN. Entra answers a bad secret with an
 * `error_description` that can quote the request back, so only the error code and the
 * first line of the message are lifted out, truncated. The body is never passed on whole.
 */

/** A token is never presented in the last two minutes of its life. */
const TOKEN_SKEW_SECONDS = 120;
/** Neither Microsoft endpoint may hang the task that is waiting on it. */
const TIMEOUT_MS = 15_000;
const MAX_ERROR_LENGTH = 300;
const DEFAULT_TOKEN_LIFETIME_SECONDS = 3600;
const MIN_TOKEN_LIFETIME_SECONDS = 60;

export class MailError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;

  constructor(
    message: string,
    options: { readonly status?: number | undefined; readonly code?: string | undefined } = {},
  ) {
    super(message);
    this.name = "MailError";
    this.status = options.status;
    this.code = options.code;
  }
}

/**
 * An image carried inside the message and referenced from the HTML as `cid:<contentId>`.
 *
 * Inline rather than linked because a remote image is blocked by default — by Outlook for
 * everyone, and by Gmail for any sender the reader has not written to, which is every
 * acknowledgement recipient. An inline one arrives with the message and shows on open.
 */
export interface InlineImage {
  readonly contentId: string;
  readonly name: string;
  readonly contentType: string;
  /** The file's bytes, base64. */
  readonly contentBytes: string;
}

export interface OutgoingMail {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly contentType?: "Text" | "HTML";
  /** Omitted when a reply should come back to the sending mailbox itself. */
  readonly replyTo?: string | undefined;
  readonly inlineImages?: ReadonlyArray<InlineImage>;
}

interface CachedToken {
  readonly token: string;
  readonly expiresAt: number;
}

let cached: CachedToken | null = null;
/**
 * The token request in flight. Two submissions arriving together await the same one
 * rather than racing, because Entra rate-limits token issuance per client.
 */
let pending: Promise<string> | null = null;

function enabledConfiguration() {
  const config = mailConfiguration();
  if (!config.enabled) {
    throw new MailError("MAIL_ENABLED is false — sendMail must not be called.");
  }
  return config;
}

async function accessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  if (pending) return pending;

  const { tenantId, clientId, clientSecret } = enabledConfiguration().graph;

  pending = (async () => {
    const response = await fetch(
      `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: "https://graph.microsoft.com/.default",
          grant_type: "client_credentials",
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );

    if (!response.ok) {
      const { code, message } = await describeFailure(response);
      throw new MailError(
        `Entra refused the client credentials (${response.status})${message ? `: ${message}` : ""}`,
        { status: response.status, code },
      );
    }

    const body = (await response.json().catch(() => null)) as {
      access_token?: unknown;
      expires_in?: unknown;
    } | null;
    if (typeof body?.access_token !== "string") {
      throw new MailError("Entra returned no access_token.");
    }

    const lifetime = Number(body.expires_in);
    const seconds = Number.isFinite(lifetime) ? lifetime : DEFAULT_TOKEN_LIFETIME_SECONDS;
    cached = {
      token: body.access_token,
      expiresAt:
        Date.now() + Math.max(seconds - TOKEN_SKEW_SECONDS, MIN_TOKEN_LIFETIME_SECONDS) * 1000,
    };
    return cached.token;
  })();

  try {
    return await pending;
  } catch (error: unknown) {
    // A failed attempt must not be remembered: the next submission gets a fresh one
    // without anybody restarting the process.
    cached = null;
    throw error;
  } finally {
    pending = null;
  }
}

/**
 * Sends one message as MAIL_SENDER. Resolves when Graph answers 202 Accepted.
 *
 * The `from` name needs no SendAs right — the address is still the sending mailbox's own.
 * `saveToSentItems` keeps a copy in the mailbox a reply gets written from, which is a free
 * record of exactly what went out.
 */
export async function sendMail(mail: OutgoingMail): Promise<void> {
  const config = enabledConfiguration();
  const token = await accessToken();

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(config.sender)}/sendMail`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        message: {
          subject: mail.subject,
          body: { contentType: mail.contentType ?? "Text", content: mail.body },
          toRecipients: [{ emailAddress: { address: mail.to } }],
          from: { emailAddress: { name: config.fromName, address: config.sender } },
          ...(mail.replyTo ? { replyTo: [{ emailAddress: { address: mail.replyTo } }] } : {}),
          ...(mail.inlineImages && mail.inlineImages.length > 0
            ? {
                attachments: mail.inlineImages.map((image) => ({
                  "@odata.type": "#microsoft.graph.fileAttachment",
                  name: image.name,
                  contentType: image.contentType,
                  contentBytes: image.contentBytes,
                  contentId: image.contentId,
                  isInline: true,
                })),
              }
            : {}),
        },
        saveToSentItems: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    },
  );

  // Graph's success is 202 Accepted with no body.
  if (response.status === 202) return;

  const { code, message } = await describeFailure(response);

  // The one failure that is a setup mistake rather than a fault, so it says where to look.
  if (response.status === 403) {
    throw new MailError(
      `Graph refused to send as ${config.sender} (403)${message ? `: ${message}` : ""}. Check that ` +
        "Mail.Send is an APPLICATION permission with admin consent, and that the " +
        "ApplicationAccessPolicy includes this mailbox.",
      { status: 403, code },
    );
  }

  throw new MailError(
    `Graph rejected the message (${response.status})${message ? `: ${message}` : ""}`,
    { status: response.status, code },
  );
}

/**
 * The code and a short message from a Microsoft error body, and nothing else from it.
 * Graph nests them under `error`; Entra puts a string in `error` and the text in
 * `error_description`, whose later lines carry trace ids nobody reading a log needs.
 */
async function describeFailure(
  response: Response,
): Promise<{ code: string | undefined; message: string | undefined }> {
  const body = (await response.json().catch(() => null)) as {
    error?: unknown;
    error_description?: unknown;
  } | null;

  const nested =
    body?.error && typeof body.error === "object"
      ? (body.error as { code?: unknown; message?: unknown })
      : undefined;
  const code = typeof nested?.code === "string" ? nested.code : stringOrUndefined(body?.error);
  const text = typeof nested?.message === "string" ? nested.message : body?.error_description;
  return { code, message: typeof text === "string" ? firstLine(text) : undefined };
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function firstLine(text: string): string {
  const line = text.split(/\r?\n/)[0]?.trim() ?? "";
  return line.length > MAX_ERROR_LENGTH ? `${line.slice(0, MAX_ERROR_LENGTH)}…` : line;
}

/** For tests: no case may inherit a token, or a pending request, from the one before. */
export function resetTokenCache(): void {
  cached = null;
  pending = null;
}
