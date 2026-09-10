// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DemoRequest } from "../../domain/lead/entities/DemoRequest";
import { BusinessEmail } from "../../domain/lead/value-objects/BusinessEmail";
import { FullName } from "../../domain/lead/value-objects/FullName";

const sendMail = vi.fn(async () => undefined);
vi.mock("./GraphMailer", () => ({ sendMail }));

const { GraphInquiryMailer } = await import("./GraphInquiryMailer");

interface SentMail {
  readonly to: string;
  readonly subject: string;
  readonly body: string;
  readonly replyTo?: string;
  readonly inlineImages?: ReadonlyArray<{ contentId: string; contentType: string }>;
}

const inquiry = {
  id: "42",
  request: DemoRequest.create({
    email: BusinessEmail.create("jane@acme.com"),
    fullName: FullName.create("Jane Doe"),
    companyName: "Acme",
  }),
  receivedAt: new Date("2026-09-10T08:30:00.000Z"),
};

function lastMail(): SentMail {
  return (sendMail.mock.calls.at(-1) as unknown as [SentMail])[0];
}

beforeEach(() => {
  sendMail.mockClear();
  vi.stubEnv("MAIL_ENABLED", "true");
  vi.stubEnv("MAIL_SENDER", "hello@famysys.com");
  vi.stubEnv("MAIL_NOTIFY_TO", "studio@famysys.com");
  vi.stubEnv("GRAPH_TENANT_ID", "tenant");
  vi.stubEnv("GRAPH_CLIENT_ID", "client");
  vi.stubEnv("GRAPH_CLIENT_SECRET", "secret");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GraphInquiryMailer", () => {
  it("notifies the studio with Reply-To set to the person who wrote in", async () => {
    await new GraphInquiryMailer().notifyStudio(inquiry);

    const mail = lastMail();
    expect(mail).toEqual(
      expect.objectContaining({
        to: "studio@famysys.com",
        replyTo: "jane@acme.com",
        contentType: "HTML",
        subject: "New inquiry — Jane Doe, Acme",
      }),
    );
    expect(mail.body).toContain("/admin/inbox#inquiry-42");
  });

  it("acknowledges the sender by first name, from the shared mailbox, with no Reply-To", async () => {
    await new GraphInquiryMailer().acknowledge(inquiry);

    const mail = lastMail();
    expect(mail.to).toBe("jane@acme.com");
    expect(mail.subject).toBe("Thanks, Jane — your brief is with Famysys Studio");
    expect(mail).not.toHaveProperty("replyTo");
  });

  it("attaches the wordmark inline and references it by content id", async () => {
    await new GraphInquiryMailer().acknowledge(inquiry);

    const mail = lastMail();
    expect(mail.inlineImages).toEqual([
      expect.objectContaining({ contentId: "famysys-studio-logo", contentType: "image/png" }),
    ]);
    expect(mail.body).toContain('src="cid:famysys-studio-logo"');
  });
});
