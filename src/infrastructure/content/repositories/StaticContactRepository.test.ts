import { describe, expect, it } from "vitest";
import { CONTACT_FIELD_ORDER } from "../../../application/lead/ValidateContactRequest";
import { contactPage } from "../static/contact.content";
import { closingCta, footerContent } from "../static/marketing.content";
import { StaticContactRepository } from "./StaticContactRepository";

function collectStrings(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const element of node) {
      collectStrings(element, out);
    }
    return out;
  }
  if (node && typeof node === "object") {
    for (const child of Object.values(node)) {
      collectStrings(child, out);
    }
  }
  return out;
}

const allCopy = collectStrings(contactPage).join(" ");

describe("StaticContactRepository", () => {
  it("returns the contact page content", async () => {
    const repository = new StaticContactRepository();

    await expect(repository.getContactPage()).resolves.toBe(contactPage);
  });
});

describe("contact page content", () => {
  it("reuses the client's own closing line and tagline rather than retyping them", () => {
    expect(contactPage.panel.closingLine).toBe(closingCta.closingLine);
    expect(contactPage.panel.tagline).toBe(footerContent.tagline);
  });

  /**
   * FIVE FIELDS, AND THE ORDER IS LOAD-BEARING. `DbContactRepository` reads these labels
   * out of a positional list, so a key added, removed or moved here without the same move
   * in `FORM_LABEL_KEYS` and a reseed silently mislabels the form — "Company" over the
   * email box, and no error anywhere. The keys also have to match `ContactRequestInput`'s,
   * which is what the form indexes them by.
   */
  it("asks five fields, in the order the form renders them", () => {
    expect(Object.keys(contactPage.form.labels)).toEqual([
      "fullName",
      "email",
      "companyName",
      "companySize",
      "brief",
    ]);
  });

  it("keeps the labels in step with the fields the validator knows about", () => {
    expect(Object.keys(contactPage.form.labels)).toEqual([...CONTACT_FIELD_ORDER]);
  });

  it("carries three numbered steps", () => {
    expect(contactPage.panel.steps.map((step) => step.numeral)).toEqual(["01", "02", "03"]);
  });

  /**
   * The parent's panel carries "SOC2 Type II Compliant", "Strict Commercial NDA" and a
   * "Zero Lock-In Guarantee". The Studio is a new arm of the business and the brief says
   * it holds none of them. A certification claimed by a business that does not hold it is
   * not a copy problem, so this is asserted rather than left to review.
   */
  it("claims no certification, compliance standard, NDA or guarantee", () => {
    for (const claim of [
      /soc\s*2/i,
      /iso\s*\d/i,
      /certifi/i,
      /compliant/i,
      /\bnda\b/i,
      /guarantee/i,
      /lock-?in/i,
    ]) {
      expect(allCopy).not.toMatch(claim);
    }
  });

  /**
   * The parent's step 02 promises "Thirty minutes". The brief gives the Studio no
   * turnaround, call length or response window, so the page states none — a duration
   * invented here would be a commitment the business never made.
   */
  it("commits to no duration, turnaround or response window", () => {
    for (const timing of [
      /\bminutes?\b/i,
      /\bhours?\b/i,
      /business day/i,
      /\bwithin \d/i,
      /\b(twenty|thirty|forty|sixty)\b/i,
      /24[\s-]?hours?/i,
    ]) {
      expect(allCopy).not.toMatch(timing);
    }
  });

  /**
   * hello@famysys.com and the phone number on famysys.com/contact belong to the parent.
   * The Studio may share them or may have its own; until the client says which, the page
   * publishes neither and the "Or reach us directly" block does not render.
   */
  it("publishes no contact details until the client supplies the Studio's own", () => {
    expect(contactPage.panel.direct.email).toBeUndefined();
    expect(contactPage.panel.direct.phone).toBeUndefined();
    expect(allCopy).not.toMatch(/@/);
    expect(allCopy).not.toMatch(/\+?\d[\d\s-]{7,}/);
  });

  it("does not reproduce the parent's QR business card", () => {
    expect(allCopy).not.toMatch(/\bqr\b/i);
    expect(allCopy).not.toMatch(/scan to connect/i);
    expect(allCopy).not.toMatch(/business card/i);
  });

  /**
   * The parent's hero is written for someone buying engineering. Nothing about a
   * creative production studio should read as if it were.
   */
  it("carries none of the parent's engineering language", () => {
    // "scope" as a noun is not inherited language — the client's own brief uses it ("the
    // right approach, scope and production model"). What is barred is the parent's
    // framing: an engineer scoping a problem that is costing the client money.
    for (const inherited of [
      /\bengineer/i,
      /what it is costing/i,
      /what is not working/i,
      /not the pitch/i,
    ]) {
      expect(allCopy).not.toMatch(inherited);
    }
  });
});
