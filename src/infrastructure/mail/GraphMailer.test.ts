// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MailError, resetTokenCache, sendMail } from "./GraphMailer";

/**
 * THE GRAPH CLIENT, WITH `fetch` STUBBED. Nothing here reaches Microsoft.
 *
 * `resetTokenCache` runs before every case, so no case inherits a token — or a pending
 * token request — from the one before it.
 */

const MAIL_ENV = {
  MAIL_ENABLED: "true",
  MAIL_SENDER: "hello@famysys.com",
  MAIL_NOTIFY_TO: "studio@famysys.com",
  MAIL_FROM_NAME: "Famysys Studio",
  GRAPH_TENANT_ID: "tenant-id",
  GRAPH_CLIENT_ID: "client-id",
  GRAPH_CLIENT_SECRET: "super-secret-value",
} as const;

const MESSAGE = { to: "studio@famysys.com", subject: "Hello", body: "Body" } as const;

function tokenResponse(token = "token-1", expiresIn = 3600): Response {
  return new Response(JSON.stringify({ access_token: token, expires_in: expiresIn }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function isTokenCall(url: unknown): boolean {
  return String(url).startsWith("https://login.microsoftonline.com/");
}

/** A fetch that issues `token-1` and accepts every send, unless told otherwise. */
function stubFetch(
  onToken: () => Response | Promise<Response> = () => tokenResponse(),
  onSend: () => Response | Promise<Response> = () => new Response(null, { status: 202 }),
) {
  const fetchMock = vi.fn<(url: unknown, init?: unknown) => Promise<Response>>(async (url) =>
    isTokenCall(url) ? onToken() : onSend(),
  );
  vi.stubGlobal("fetch", fetchMock);
  return {
    fetchMock,
    tokenCalls: () => fetchMock.mock.calls.filter(([url]) => isTokenCall(url)).length,
    sendCalls: () => fetchMock.mock.calls.filter(([url]) => !isTokenCall(url)),
  };
}

function sentBody(call: unknown[]): {
  message: Record<string, unknown>;
  saveToSentItems: boolean;
} {
  const init = call[1] as { body: string };
  return JSON.parse(init.body) as { message: Record<string, unknown>; saveToSentItems: boolean };
}

beforeEach(() => {
  resetTokenCache();
  for (const [name, value] of Object.entries(MAIL_ENV)) vi.stubEnv(name, value);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("sendMail — the token", () => {
  it("caches the token across sends", async () => {
    const { tokenCalls, sendCalls } = stubFetch();

    await sendMail(MESSAGE);
    await sendMail(MESSAGE);

    expect(tokenCalls()).toBe(1);
    expect(sendCalls()).toHaveLength(2);
  });

  it("issues one token request for concurrent sends", async () => {
    let release: (response: Response) => void = () => undefined;
    const slowToken = new Promise<Response>((resolve) => {
      release = resolve;
    });
    const { tokenCalls, sendCalls } = stubFetch(() => slowToken);

    const sends = Promise.all([sendMail(MESSAGE), sendMail(MESSAGE), sendMail(MESSAGE)]);
    release(tokenResponse());
    await sends;

    expect(tokenCalls()).toBe(1);
    expect(sendCalls()).toHaveLength(3);
  });

  it("does not cache a failed token: the next send asks again", async () => {
    const answers = [
      jsonResponse(401, { error: "invalid_client", error_description: "AADSTS7000215: Invalid client secret provided." }),
      tokenResponse("token-2"),
    ];
    const { tokenCalls, sendCalls } = stubFetch(() => answers.shift() ?? tokenResponse());

    await expect(sendMail(MESSAGE)).rejects.toBeInstanceOf(MailError);
    await sendMail(MESSAGE);

    expect(tokenCalls()).toBe(2);
    const [call] = sendCalls();
    expect((call?.[1] as { headers: Record<string, string> }).headers.authorization).toBe(
      "Bearer token-2",
    );
  });

  it("asks for a new token once the cached one is inside its expiry skew", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-10T10:00:00Z"));
    const { tokenCalls } = stubFetch(() => tokenResponse("token", 3600));

    await sendMail(MESSAGE);
    // 3600s lifetime less the 120s skew: still cached just before, refreshed just after.
    vi.setSystemTime(new Date("2026-09-10T10:57:59Z"));
    await sendMail(MESSAGE);
    expect(tokenCalls()).toBe(1);

    vi.setSystemTime(new Date("2026-09-10T10:58:01Z"));
    await sendMail(MESSAGE);
    expect(tokenCalls()).toBe(2);
  });

  it("reports Entra's refusal without the secret or the trace lines", async () => {
    stubFetch(() =>
      jsonResponse(401, {
        error: "invalid_client",
        error_description:
          "AADSTS7000215: Invalid client secret provided.\r\nTrace ID: abc\r\nCorrelation ID: def",
      }),
    );

    const error = (await sendMail(MESSAGE).catch((caught: unknown) => caught)) as MailError;

    expect(error.message).toContain("AADSTS7000215");
    expect(error.message).not.toContain("Trace ID");
    expect(error.message).not.toContain(MAIL_ENV.GRAPH_CLIENT_SECRET);
    expect(error.status).toBe(401);
    expect(error.code).toBe("invalid_client");
  });

  it("truncates a long error message rather than logging it whole", async () => {
    stubFetch(() => jsonResponse(400, { error: "invalid_request", error_description: "x".repeat(2000) }));

    const error = (await sendMail(MESSAGE).catch((caught: unknown) => caught)) as MailError;

    expect(error.message.length).toBeLessThan(400);
  });
});

describe("sendMail — the message", () => {
  it("treats 202 as success and sends as MAIL_SENDER with the configured name", async () => {
    const { sendCalls } = stubFetch();

    await expect(sendMail({ ...MESSAGE, replyTo: "jane@acme.com" })).resolves.toBeUndefined();

    const [call] = sendCalls();
    expect(String(call?.[0])).toBe(
      "https://graph.microsoft.com/v1.0/users/hello%40famysys.com/sendMail",
    );
    const body = sentBody(call ?? []);
    expect(body.saveToSentItems).toBe(true);
    expect(body.message.from).toEqual({
      emailAddress: { name: "Famysys Studio", address: "hello@famysys.com" },
    });
    expect(body.message.toRecipients).toEqual([
      { emailAddress: { address: "studio@famysys.com" } },
    ]);
    expect(body.message.replyTo).toEqual([{ emailAddress: { address: "jane@acme.com" } }]);
  });

  it("sends no replyTo at all when none is given", async () => {
    const { sendCalls } = stubFetch();

    await sendMail(MESSAGE);

    expect(sentBody(sendCalls()[0] ?? []).message).not.toHaveProperty("replyTo");
  });

  it("carries inline images as inline file attachments, and none when there are none", async () => {
    const { sendCalls } = stubFetch();

    await sendMail({
      ...MESSAGE,
      inlineImages: [
        { contentId: "logo", name: "logo.png", contentType: "image/png", contentBytes: "AAAA" },
      ],
    });
    await sendMail(MESSAGE);

    const [withImage, withoutImage] = sendCalls();
    expect(sentBody(withImage ?? []).message.attachments).toEqual([
      {
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: "logo.png",
        contentType: "image/png",
        contentBytes: "AAAA",
        contentId: "logo",
        isInline: true,
      },
    ]);
    expect(sentBody(withoutImage ?? []).message).not.toHaveProperty("attachments");
  });

  it("names the setup mistake on a 403", async () => {
    stubFetch(undefined, () =>
      jsonResponse(403, { error: { code: "ErrorAccessDenied", message: "Access is denied." } }),
    );

    const error = (await sendMail(MESSAGE).catch((caught: unknown) => caught)) as MailError;

    expect(error).toBeInstanceOf(MailError);
    expect(error.status).toBe(403);
    expect(error.code).toBe("ErrorAccessDenied");
    expect(error.message).toContain("hello@famysys.com");
    expect(error.message).toContain("Mail.Send");
    expect(error.message).toContain("ApplicationAccessPolicy");
  });

  it("reports any other refusal with its status", async () => {
    stubFetch(undefined, () =>
      jsonResponse(400, { error: { code: "ErrorInvalidRecipients", message: "Bad recipient." } }),
    );

    await expect(sendMail(MESSAGE)).rejects.toThrow("Graph rejected the message (400): Bad recipient.");
  });

  it("refuses to run at all when MAIL_ENABLED is false", async () => {
    vi.stubEnv("MAIL_ENABLED", "false");
    const { fetchMock } = stubFetch();

    await expect(sendMail(MESSAGE)).rejects.toThrow(/MAIL_ENABLED is false/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
