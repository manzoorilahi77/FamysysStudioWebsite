import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import type { InquiryDeliveryLog } from "../../domain/lead/repositories/InquiryDeliveryLog";
import type { InquiryMailer, ReceivedInquiry } from "../../domain/lead/services/InquiryMailer";
import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { NotifyOfInquiry } from "./NotifyOfInquiry";

class FakeMailer implements InquiryMailer {
  notifyError: Error | undefined;
  acknowledgeError: Error | undefined;
  notified: string[] = [];
  acknowledged: string[] = [];

  async notifyStudio(inquiry: ReceivedInquiry): Promise<void> {
    if (this.notifyError) throw this.notifyError;
    this.notified.push(inquiry.id);
  }

  async acknowledge(inquiry: ReceivedInquiry): Promise<void> {
    if (this.acknowledgeError) throw this.acknowledgeError;
    this.acknowledged.push(inquiry.id);
  }
}

class FakeDeliveryLog implements InquiryDeliveryLog {
  error: Error | undefined;
  notified: string[] = [];
  acknowledged: string[] = [];

  async markNotified(id: string): Promise<void> {
    if (this.error) throw this.error;
    this.notified.push(id);
  }

  async markAcknowledged(id: string): Promise<void> {
    if (this.error) throw this.error;
    this.acknowledged.push(id);
  }
}

const inquiry: ReceivedInquiry = {
  id: "42",
  request: DemoRequest.create({ email: BusinessEmail.create("jane@acme.com") }),
  receivedAt: new Date("2026-09-10T08:30:00.000Z"),
};

/** A Graph-shaped failure whose message quotes the visitor's address, as Microsoft can. */
function mailFailure(status: number): Error {
  return Object.assign(new Error("Recipient jane@acme.com is not valid."), {
    name: "MailError",
    status,
    code: "ErrorInvalidRecipients",
  });
}

let debug: ReturnType<typeof vi.spyOn>;
let warn: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  debug = vi.spyOn(console, "debug").mockImplementation(() => undefined);
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  error = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function logged(spy: ReturnType<typeof vi.spyOn>): string {
  return spy.mock.calls.map((call) => call.join(" ")).join("\n");
}

describe("NotifyOfInquiry", () => {
  it("skips the send with a debug line — not a warning — when mail is off", async () => {
    const log = new FakeDeliveryLog();

    await new NotifyOfInquiry(undefined, log).execute(inquiry);

    expect(log.notified).toEqual([]);
    expect(log.acknowledged).toEqual([]);
    expect(logged(debug)).toContain("42");
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("sends both messages and stamps both", async () => {
    const mailer = new FakeMailer();
    const log = new FakeDeliveryLog();

    await new NotifyOfInquiry(mailer, log).execute(inquiry);

    expect(mailer.notified).toEqual(["42"]);
    expect(mailer.acknowledged).toEqual(["42"]);
    expect(log.notified).toEqual(["42"]);
    expect(log.acknowledged).toEqual(["42"]);
  });

  it("still stamps the notification when the acknowledgement bounces, and only warns", async () => {
    const mailer = new FakeMailer();
    mailer.acknowledgeError = mailFailure(400);
    const log = new FakeDeliveryLog();

    await new NotifyOfInquiry(mailer, log).execute(inquiry);

    expect(log.notified).toEqual(["42"]);
    expect(log.acknowledged).toEqual([]);
    expect(error).not.toHaveBeenCalled();
    expect(logged(warn)).toContain("42");
    // The acknowledgement's recipient is the visitor: their address stays out of the log.
    expect(logged(warn)).not.toContain("jane@acme.com");
  });

  it("still stamps the acknowledgement when the notification fails, and logs an error", async () => {
    const mailer = new FakeMailer();
    mailer.notifyError = mailFailure(403);
    const log = new FakeDeliveryLog();

    await new NotifyOfInquiry(mailer, log).execute(inquiry);

    expect(log.notified).toEqual([]);
    expect(log.acknowledged).toEqual(["42"]);
    expect(logged(error)).toContain("42");
    expect(logged(error)).toContain("status 403");
  });

  it("logs a stamp that could not be written and does not throw — the mail went out", async () => {
    const log = new FakeDeliveryLog();
    log.error = new Error("database unavailable");

    await expect(new NotifyOfInquiry(new FakeMailer(), log).execute(inquiry)).resolves.toBeUndefined();

    expect(logged(error)).toContain("notified_at");
    expect(logged(error)).toContain("ack_sent_at");
  });

  it("never rejects, even when everything fails", async () => {
    const mailer = new FakeMailer();
    mailer.notifyError = mailFailure(500);
    mailer.acknowledgeError = mailFailure(500);

    await expect(
      new NotifyOfInquiry(mailer, new FakeDeliveryLog()).execute(inquiry),
    ).resolves.toBeUndefined();
  });
});
