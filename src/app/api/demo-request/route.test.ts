import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InquiryMailer } from "../../../domain/lead/services/InquiryMailer";

/**
 * THE INTAKE IS REPLACED, AND THAT IS THE POINT OF THE MOCK.
 *
 * This route now writes an enquiry to MySQL. A test that let it do so would need
 * credentials, would fail on a machine without them, and — worse — would put rows in the
 * real inbox every time the suite ran. What is under test here is the route's contract:
 * which payloads it accepts, which it rejects, and with what. Where an accepted one ends
 * up is the repository's business, and has its own tests.
 *
 * `after()` is replaced too. Outside a real request Next refuses to schedule anything, and
 * collecting the tasks lets a test prove the order that matters: the response exists first,
 * and the mail runs only when a task is run by hand.
 *
 * The mocks must be declared before the route is imported, which is why the import below
 * is not at the top of the file.
 */
const submit = vi.fn(async () => "42");
const markNotified = vi.fn(async () => undefined);
const markAcknowledged = vi.fn(async () => undefined);
const take = vi.fn((): { allowed: boolean; retryAfterSeconds?: number } => ({ allowed: true }));
const mail: { mailer: InquiryMailer | undefined } = { mailer: undefined };
const scheduled: Array<() => unknown> = [];

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, after: (task: () => unknown) => void scheduled.push(task) };
});

vi.mock("../../../infrastructure/di/container", () => ({
  container: {
    demoRequestIntake: { submit },
    inquiryDeliveryLog: { markNotified, markAcknowledged },
    get inquiryMailer() {
      return mail.mailer;
    },
    submissionRateLimit: { take },
  },
}));

const { POST } = await import("./route");

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/demo-request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function runScheduled(): Promise<void> {
  await Promise.all(scheduled.splice(0).map((task) => task()));
}

beforeEach(() => {
  submit.mockClear();
  markNotified.mockClear();
  markAcknowledged.mockClear();
  take.mockReset();
  take.mockImplementation(() => ({ allowed: true }));
  mail.mailer = undefined;
  scheduled.length = 0;
  vi.spyOn(console, "debug").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/demo-request", () => {
  it("returns 201 with the stored id for a well-formed payload", async () => {
    const response = await POST(
      jsonRequest({
        fullName: "Jane Doe",
        email: "jane@acme.com",
        companyName: "Acme Inc.",
        companySize: "50–200",
      }),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, id: "42", confirmationEmail: false });
  });

  it("tells the page a confirmation email is coming only when mail is on", async () => {
    mail.mailer = { notifyStudio: vi.fn(async () => undefined), acknowledge: vi.fn(async () => undefined) };

    const response = await POST(jsonRequest({ email: "jane@acme.com" }));

    expect(await response.json()).toMatchObject({ confirmationEmail: true });
  });

  /** The endpoint's whole requirement, in one payload. */
  it("returns 201 for an email on its own", async () => {
    expect((await POST(jsonRequest({ email: "jane@acme.com" }))).status).toBe(201);
  });

  it.each([
    ["no name", { email: "jane@acme.com", companyName: "Acme Inc.", companySize: "50–200" }],
    ["no company", { email: "jane@acme.com", fullName: "Jane Doe" }],
    ["blank answers", { email: "jane@acme.com", fullName: "  ", companyName: "", brief: "  " }],
    ["a non-string in an optional field", { email: "jane@acme.com", companyName: 42 }],
  ])("returns 201 for a payload with %s", async (_label, payload) => {
    expect((await POST(jsonRequest(payload))).status).toBe(201);
  });

  it("returns 422 naming the email — the only field it requires — when it is missing", async () => {
    const response = await POST(jsonRequest({ fullName: "Jane Doe" }));
    const body = (await response.json()) as { errors?: Record<string, string> };

    expect(response.status).toBe(422);
    expect(body.errors?.email).toBeDefined();
    // Nothing else is required, so nothing else may be reported as missing.
    expect(Object.keys(body.errors ?? {})).toEqual(["email"]);
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new Request("http://localhost/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 201 for a personal address such as gmail.com", async () => {
    const response = await POST(jsonRequest({ fullName: "Jane Doe", email: "jane@gmail.com" }));

    expect(response.status).toBe(201);
  });

  it("returns 422 with a short field error for a malformed address", async () => {
    const response = await POST(jsonRequest({ email: "shaf#gmail.com" }));
    const body = (await response.json()) as { errors?: { email?: string } };

    expect(response.status).toBe(422);
    expect(body.errors?.email).toBe("Enter a valid email address, like name@company.com");
  });

  it("returns 422 offering the corrected address for a likely typo, and stores nothing", async () => {
    const response = await POST(jsonRequest({ email: "shaf@gmai.com" }));
    const body = (await response.json()) as { errors?: { email?: string } };

    expect(response.status).toBe(422);
    expect(body.errors?.email).toBe("Check the address — did you mean shaf@gmail.com?");
    expect(submit).not.toHaveBeenCalled();
  });

  /** A mononym is a name. It used to be a 422; accepting it is the point of the change. */
  it("returns 201 for a single-word name", async () => {
    const response = await POST(jsonRequest({ fullName: "Prince", email: "jane@acme.com" }));

    expect(response.status).toBe(201);
  });

  it("returns 422 with a field error when an optional answer is longer than its column", async () => {
    const response = await POST(
      jsonRequest({ email: "jane@acme.com", companyName: "a".repeat(192) }),
    );
    const body = (await response.json()) as { errors?: { companyName?: string } };

    expect(response.status).toBe(422);
    expect(body.errors?.companyName).toBeDefined();
  });

  /**
   * The endpoint is public, so the guard against a script posting megabytes at it is
   * checked here rather than assumed. It has to hold whether or not Content-Length agrees
   * with the body, so the header is left off and the read length is what refuses it.
   */
  it("returns 413 for a body past the size ceiling", async () => {
    const request = new Request("http://localhost/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "jane@acme.com", brief: "a".repeat(70_000) }),
    });

    expect((await POST(request)).status).toBe(413);
  });

  it("returns 422 with a field error for an unrecognized company size", async () => {
    const response = await POST(
      jsonRequest({ email: "jane@acme.com", companySize: "not-a-band" }),
    );
    const body = (await response.json()) as { errors?: { companySize?: string } };

    expect(response.status).toBe(422);
    expect(body.errors?.companySize).toBeDefined();
  });

  it("returns 429 with Retry-After when the address is over its ceiling, and stores nothing", async () => {
    take.mockImplementation(() => ({ allowed: false, retryAfterSeconds: 120 }));

    const response = await POST(jsonRequest({ email: "jane@acme.com" }));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");
    expect(submit).not.toHaveBeenCalled();
  });

  it("returns 503 and schedules no mail when the enquiry cannot be stored", async () => {
    submit.mockRejectedValueOnce(new Error("connection refused"));

    const response = await POST(jsonRequest({ email: "jane@acme.com" }));

    expect(response.status).toBe(503);
    expect(scheduled).toHaveLength(0);
  });
});

describe("POST /api/demo-request — the mail after the response", () => {
  it("stores the row and skips the send when mail is off", async () => {
    const response = await POST(jsonRequest({ email: "jane@acme.com" }));
    await runScheduled();

    expect(response.status).toBe(201);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(markNotified).not.toHaveBeenCalled();
    expect(markAcknowledged).not.toHaveBeenCalled();
  });

  it("answers before any mail is sent, then sends both and stamps both", async () => {
    const notifyStudio = vi.fn(async () => undefined);
    const acknowledge = vi.fn(async () => undefined);
    mail.mailer = { notifyStudio, acknowledge };

    const response = await POST(jsonRequest({ email: "jane@acme.com" }));

    expect(response.status).toBe(201);
    expect(notifyStudio).not.toHaveBeenCalled();

    await runScheduled();

    expect(notifyStudio).toHaveBeenCalledWith(expect.objectContaining({ id: "42" }));
    expect(acknowledge).toHaveBeenCalledWith(expect.objectContaining({ id: "42" }));
    expect(markNotified).toHaveBeenCalledWith("42");
    expect(markAcknowledged).toHaveBeenCalledWith("42");
  });

  /** Rule one: a mail failure costs a notification, never the enquiry or the response. */
  it("keeps the 201 and the row when every send fails", async () => {
    mail.mailer = {
      notifyStudio: vi.fn(async () => {
        throw new Error("Entra refused the client credentials (401)");
      }),
      acknowledge: vi.fn(async () => {
        throw new Error("Graph rejected the message (400)");
      }),
    };

    const response = await POST(jsonRequest({ email: "jane@acme.com" }));

    expect(response.status).toBe(201);
    expect(submit).toHaveBeenCalledTimes(1);
    await expect(runScheduled()).resolves.toBeUndefined();
    expect(markNotified).not.toHaveBeenCalled();
  });
});
