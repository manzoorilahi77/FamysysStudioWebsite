// @vitest-environment node
import { describe, expect, it } from "vitest";
import { esc, greetingName, multiline, safeHref } from "./html";
import { acknowledgementSubject, inquiryAcknowledgement } from "./inquiryAcknowledgement";
import {
  BRIEF_PREVIEW_LENGTH,
  inquiryNotification,
  notificationSubject,
  roleLine,
  type InquiryMailContent,
} from "./inquiryNotification";

const ADMIN_URL = "https://studio.famysys.com/admin/inbox#inquiry-42";
const OPTIONS = { adminUrl: ADMIN_URL };

function inquiry(overrides: Partial<InquiryMailContent> = {}): InquiryMailContent {
  return {
    email: "jane@acme.com",
    receivedAt: new Date("2026-09-10T08:30:00.000Z"),
    ...overrides,
  };
}

/** What a reader sees: the body text with the stylesheet and the markup taken out. */
function visibleText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

describe("the notification's subject and band", () => {
  it("carries who and from where", () => {
    expect(notificationSubject(inquiry({ fullName: "Jane Doe", companyName: "Acme" }))).toBe(
      "New inquiry — Jane Doe, Acme",
    );
  });

  it("falls back to the name alone, never leaving a dangling comma", () => {
    expect(notificationSubject(inquiry({ fullName: "Jane Doe" }))).toBe("New inquiry — Jane Doe");
    expect(notificationSubject(inquiry({ fullName: "Jane Doe", companyName: "  " }))).toBe(
      "New inquiry — Jane Doe",
    );
  });

  it("falls back to the address when no name was given", () => {
    expect(notificationSubject(inquiry())).toBe("New inquiry — jane@acme.com");
  });

  it("filters the empty values out before joining role, company and size", () => {
    expect(roleLine(inquiry({ role: "CTO", companySize: "11–50" }))).toBe("CTO · 11–50");
    expect(roleLine(inquiry({ role: "CTO", companyName: " ", companySize: "11–50" }))).toBe(
      "CTO · 11–50",
    );
    expect(roleLine(inquiry())).toBe("");
  });
});

describe("the notification's body", () => {
  it("omits every optional line that was not answered, with no placeholder", () => {
    const { html } = inquiryNotification(inquiry(), OPTIONS);
    const text = visibleText(html);

    expect(text).not.toContain("Website");
    expect(text).not.toContain(" · ");
    expect(html).not.toMatch(/undefined|null/);
    expect(text).toContain("jane@acme.com");
    expect(text).toContain("Reply to the sender");
  });

  it("shows the band and a Reply button named for the sender", () => {
    const { html } = inquiryNotification(
      inquiry({ fullName: "Jane Doe", role: "CTO", companyName: "Acme", companySize: "11–50" }),
      OPTIONS,
    );
    const text = visibleText(html);

    expect(text).toContain("CTO · Acme · 11–50");
    expect(text).toContain("Reply to Jane");
    expect(html).toContain(
      'href="mailto:jane@acme.com?subject=Re%3A%20Your%20enquiry%20to%20Famysys%20Studio"',
    );
  });

  it("escapes everything a stranger typed", () => {
    const { html } = inquiryNotification(
      inquiry({ fullName: "<script>alert(1)</script>", brief: '<img src=x onerror="alert(1)">' }),
      OPTIONS,
    );

    expect(html).not.toContain("<script>alert(1)");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("keeps the brief's line breaks", () => {
    const { html } = inquiryNotification(inquiry({ brief: "Line one\nLine two" }), OPTIONS);

    expect(html).toContain("Line one<br>Line two");
  });

  it("renders a javascript: website as text, not as a link", () => {
    const { html } = inquiryNotification(
      inquiry({ companyWebsite: "javascript:alert(document.cookie)" }),
      OPTIONS,
    );

    expect(html).not.toMatch(/href="javascript:/i);
    expect(visibleText(html)).toContain("javascript:alert(document.cookie)");
  });

  it("links a bare host under https", () => {
    const { html } = inquiryNotification(inquiry({ companyWebsite: "acme.com" }), OPTIONS);

    expect(html).toContain('href="https://acme.com/"');
  });

  it("links the email as mailto and a button to the enquiry in the admin inbox", () => {
    const { html } = inquiryNotification(inquiry(), OPTIONS);

    expect(html).toContain('href="mailto:jane@acme.com"');
    expect(html).toContain(`href="${ADMIN_URL}"`);
  });

  it("truncates a very long brief and says where the rest is", () => {
    const brief = "a".repeat(BRIEF_PREVIEW_LENGTH + 500);
    const { html } = inquiryNotification(inquiry({ brief }), OPTIONS);

    expect(html).not.toContain("a".repeat(BRIEF_PREVIEW_LENGTH + 1));
    expect(html).toContain("the full text is in the admin inbox");
  });
});

describe("the acknowledgement", () => {
  it("greets the sender by first name when they gave one", () => {
    const { subject, html } = inquiryAcknowledgement({ fullName: "Shafwan Ahmed" });

    expect(subject).toBe("Thanks, Shafwan — your brief is with Famysys Studio");
    expect(visibleText(html)).toContain("Thanks, Shafwan.");
    expect(html).not.toContain("Ahmed");
  });

  it("thanks them without a name when none was given", () => {
    const { subject, html } = inquiryAcknowledgement();

    expect(subject).toBe("Your brief is with Famysys Studio");
    expect(visibleText(html)).toContain("Thank you for writing in.");
  });

  /**
   * The acknowledgement goes to any address typed into an anonymous form. Whatever it
   * echoes is text a stranger chose, sent from the studio's domain — so a "name" that is
   * really a link or a sentence must not come through as one.
   */
  it("will not carry a link or a sentence in the name field", () => {
    const { html } = inquiryAcknowledgement({ fullName: "http://spam.example buy now" });

    expect(html).not.toContain("spam.example");
    expect(html).not.toContain("buy now");
    expect(acknowledgementSubject("12345")).toBe("Your brief is with Famysys Studio");
  });

  /**
   * The contact page states no turnaround, so the autoresponder must not either. Anything
   * here that reads as a promise about time is a commitment the studio never made.
   */
  it("promises no response time", () => {
    const { subject, html } = inquiryAcknowledgement({ fullName: "Jane" });
    const text = `${subject} ${visibleText(html)}`;

    expect(text).not.toMatch(
      /\b(within|hours?|days?|business day|working day|weeks?|asap|shortly|soon|promptly|today|tomorrow|24\s*\/\s*7)\b/i,
    );
    expect(text).not.toMatch(/\d+\s*(h|hrs?|hours?|days?|weeks?|mins?|minutes?)\b/i);
  });

  it("sets out the contact page's three next steps", () => {
    const text = visibleText(inquiryAcknowledgement().html);

    expect(text).toContain("Someone who makes the work reads it");
    expect(text).toContain("A short call");
    expect(text).toContain("A written approach");
  });
});

describe("both messages, as email HTML", () => {
  it.each([
    ["notification", inquiryNotification(inquiry({ fullName: "Jane" }), OPTIONS).html],
    ["acknowledgement", inquiryAcknowledgement({ fullName: "Jane" }).html],
  ])("the %s declares its colour schemes, carries a preheader, and loads nothing remote", (_label, html) => {
    expect(html).toContain('<meta name="color-scheme" content="light dark">');
    expect(html).toContain('<meta name="supported-color-schemes" content="light dark">');
    expect(html).toMatch(/<div style="display:none;[^"]*">[^<]+<\/div>/);
    expect(html).not.toMatch(/<img[^>]+src="https?:/i);
    expect(html).not.toMatch(/<link|@import|url\(/i);
    expect(html).not.toMatch(/display:\s*(flex|grid)|position:|var\(--/i);
    expect(html).toContain('width="600"');
  });

  it("shows the inline logo when one is attached, and a text wordmark when not", () => {
    const withLogo = inquiryAcknowledgement({ logoSrc: "cid:famysys-studio-logo" }).html;
    const withoutLogo = inquiryAcknowledgement().html;

    expect(withLogo).toContain('src="cid:famysys-studio-logo"');
    expect(withoutLogo).not.toContain("<img");
    expect(visibleText(withoutLogo)).toContain("STUDIO");
  });
});

describe("the helpers", () => {
  it("escapes before adding line breaks, so <br> is the only markup in the result", () => {
    expect(multiline("<b>\nbold")).toBe("&lt;b&gt;<br>bold");
    expect(esc(`"'&`)).toBe("&quot;&#39;&amp;");
  });

  it.each([
    ["Shafwan Ahmed", "Shafwan"],
    ["  zoë  ", "zoë"],
    ["Mary-Jane Watson", "Mary-Jane"],
    ["O'Brien", "O'Brien"],
    ["", undefined],
    [undefined, undefined],
    ["12345", undefined],
    ["A".repeat(30), undefined],
  ])("greetingName(%j) is %j", (raw, expected) => {
    expect(greetingName(raw)).toBe(expected);
  });

  it.each([
    ["javascript:alert(1)", undefined],
    ["JaVaScRiPt:alert(1)", undefined],
    ["data:text/html,<b>x</b>", undefined],
    ["vbscript:msgbox(1)", undefined],
    ["", undefined],
    ["http://acme.com", "http://acme.com/"],
    ["https://acme.com/work", "https://acme.com/work"],
    ["acme.com/work", "https://acme.com/work"],
  ])("safeHref(%j) is %j", (raw, expected) => {
    expect(safeHref(raw)).toBe(expected);
  });
});
