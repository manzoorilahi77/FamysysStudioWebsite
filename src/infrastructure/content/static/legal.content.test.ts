import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { footerContent } from "./marketing.content";
import { privacyDocument } from "./privacy.content";
import { termsDocument } from "./terms.content";

/**
 * THE TWO DOCUMENTS ARE DRAFTS, AND THE PAGE HAS TO SAY SO UNTIL THEY ARE NOT.
 *
 * Every clause that names an entity, a place, a period or a practice is marked
 * `TODO(client): legal review required` in the content file, and the document prints a
 * review-status line under its date while any such mark remains. This asserts the two
 * halves agree: while the files carry marks, `reviewStatus` is set. The day the marks
 * are resolved this test fails, which is the reminder to take the line off the page.
 */
function marksIn(file: string): number {
  const source = readFileSync(join(process.cwd(), "src/infrastructure/content/static", file), "utf8");
  return (source.match(/TODO\(client\): legal review required/g) ?? []).length;
}

describe("the legal documents", () => {
  it("keep the parent's structure: twelve terms sections and fourteen privacy sections, numbered in order", () => {
    expect(termsDocument.sections.map((section) => section.number)).toEqual(
      Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")),
    );
    expect(privacyDocument.sections.map((section) => section.number)).toEqual(
      Array.from({ length: 14 }, (_, index) => String(index + 1).padStart(2, "0")),
    );
  });

  it("give every section at least one block, and end on the contact section", () => {
    for (const document of [termsDocument, privacyDocument]) {
      for (const section of document.sections) {
        expect(section.blocks.length, section.heading).toBeGreaterThan(0);
      }
      expect(document.sections.at(-1)?.heading).toBe("How to contact us");
    }
  });

  it("carry the parent's head: a route, a one-sentence lead, and both dates", () => {
    expect(termsDocument.href).toBe("/terms");
    expect(privacyDocument.href).toBe("/privacy");
    for (const document of [termsDocument, privacyDocument]) {
      expect(document.lead.length).toBeGreaterThan(40);
      expect(document.publishedDate).toBe(document.effectiveDate);
      expect(document.labels.allDocuments).toBe("All legal documents");
    }
  });

  it("sign off with the footer's address and email rather than a second copy of either", () => {
    for (const document of [termsDocument, privacyDocument]) {
      expect(document.contact.addressLines).toEqual(footerContent.addressLines);
      expect(document.contact.email).toBe(footerContent.contactEmail);
    }
  });

  it("print the review-status line for as long as the content files carry review marks", () => {
    const marks = marksIn("terms.content.ts") + marksIn("privacy.content.ts") + marksIn("legalShared.ts");
    expect(marks).toBeGreaterThan(0);
    expect(termsDocument.reviewStatus).not.toBeNull();
    expect(privacyDocument.reviewStatus).not.toBeNull();
  });

  /**
   * The privacy policy is a list of facts about this system. Three of the parent's claims
   * are NOT true of it and must not be inherited: an IP address stored with an enquiry, a
   * 24-month retention period with redaction, and named accounts in the panel.
   */
  it("do not inherit the parent's claims that are false of this site", () => {
    const text = privacyDocument.sections
      .flatMap((section) => section.blocks)
      .flatMap((block) => (block.kind === "paragraph" ? [block.text] : [...block.items]))
      .join("\n");

    expect(text).toMatch(/no IP address/);
    expect(text).not.toMatch(/24 months/);
    expect(text).not.toMatch(/named account/);
    expect(text).not.toMatch(/email service/);
  });
});
