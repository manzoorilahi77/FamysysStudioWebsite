import { describe, expect, it } from "vitest";
import { StaticLegalRepository } from "../../infrastructure/content/repositories/StaticLegalRepository";
import { GetLegalIndex } from "./GetLegalDocuments";

describe("GetLegalIndex", () => {
  it("lists the privacy policy first and the terms second, as famysys.com/legal/ does", async () => {
    const index = await new GetLegalIndex(new StaticLegalRepository()).execute();

    expect(index.entries.map((entry) => entry.href)).toEqual(["/privacy", "/terms"]);
  });

  it("reads each entry off the document itself rather than a second list", async () => {
    const repository = new StaticLegalRepository();
    const [index, terms] = await Promise.all([
      new GetLegalIndex(repository).execute(),
      repository.getTerms(),
    ]);
    const entry = index.entries.find((candidate) => candidate.href === "/terms");

    expect(entry).toEqual({
      href: terms.href,
      title: terms.title,
      lead: terms.lead,
      effectiveDate: terms.effectiveDate,
      effectiveLabel: terms.labels.effective,
    });
  });

  it("carries the index page's own copy, with a label for every entry's link", async () => {
    const index = await new GetLegalIndex(new StaticLegalRepository()).execute();

    expect(index.copy.title.length).toBeGreaterThan(0);
    expect(index.copy.lead.length).toBeGreaterThan(0);
    expect(index.copy.readLabel).toBe("Read");
  });
});
