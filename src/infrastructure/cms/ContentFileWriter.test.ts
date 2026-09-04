import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContentFileWriter } from "./ContentFileWriter";

/**
 * The writer resolves everything against `process.cwd()`, so these run against a throwaway
 * project tree rather than the repository's own content. Writing the real files from a
 * test would be a test that edits the site.
 */
const CONTENT_ROOT = "src/infrastructure/content/static";
const FILE = "marketing.content.ts";

const FIXTURE = `// Every string in this file is the client's own copy, taken verbatim from their briefs.
//
// TODO(client): the brief supplies no footer tagline — see docs/content-todo.md.

import { createCta } from "../../../domain/shared/value-objects/Cta";

/** The hero, as the brief gives it. */
export const heroContent = {
  // A comment that has to survive.
  heading: "Creative production, without the agency overhead.",
  primaryCta: createCta("Start a Conversation", "/contact"),
};

export const faqBlock = {
  items: [
    {
      question: "Do you work with small businesses?",
      answer: "Yes.",
    },
  ],
};
`;

let projectRoot: string;

beforeEach(() => {
  projectRoot = mkdtempSync(join(tmpdir(), "famysys-cms-writer-"));
  mkdirSync(join(projectRoot, CONTENT_ROOT), { recursive: true });
  writeFileSync(join(projectRoot, CONTENT_ROOT, FILE), FIXTURE, "utf8");
  vi.spyOn(process, "cwd").mockReturnValue(projectRoot);
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(projectRoot, { recursive: true, force: true });
});

function read(): string {
  return readFileSync(join(projectRoot, CONTENT_ROOT, FILE), "utf8");
}

const pointer = (path: ReadonlyArray<string | number>, symbol = "heroContent") => ({
  file: FILE,
  symbol,
  path,
});

describe("ContentFileWriter", () => {
  it("replaces exactly the string it was pointed at", async () => {
    await new ContentFileWriter().apply([
      { pointer: pointer(["heading"]), value: "A new heading." },
    ]);

    expect(read()).toContain('heading: "A new heading."');
    expect(read()).not.toContain("without the agency overhead");
  });

  // The reason this whole class parses instead of running a regex.
  it("keeps every comment, including the TODO(client) markers", async () => {
    await new ContentFileWriter().apply([
      { pointer: pointer(["heading"]), value: "A new heading." },
    ]);
    const after = read();

    expect(after).toContain("TODO(client): the brief supplies no footer tagline");
    expect(after).toContain("// A comment that has to survive.");
    expect(after).toContain("/** The hero, as the brief gives it. */");
    expect(after).toContain("// Every string in this file is the client's own copy");
  });

  it("leaves the imports and the rest of the file byte-identical", async () => {
    await new ContentFileWriter().apply([
      { pointer: pointer(["heading"]), value: "A new heading." },
    ]);

    const before = FIXTURE.split("\n");
    const after = read().split("\n");
    const changed = after.filter((line, index) => line !== before[index]);

    expect(changed).toHaveLength(1);
    expect(changed[0]).toContain("A new heading.");
  });

  it("writes a CTA label through a call argument", async () => {
    await new ContentFileWriter().apply([
      { pointer: pointer(["primaryCta", 0]), value: "Talk to us" },
    ]);

    expect(read()).toContain('createCta("Talk to us", "/contact")');
  });

  it("applies several edits to one file in one write", async () => {
    await new ContentFileWriter().apply([
      { pointer: pointer(["heading"]), value: "One" },
      { pointer: pointer(["primaryCta", 1]), value: "/creative-services" },
    ]);

    expect(read()).toContain('heading: "One"');
    expect(read()).toContain('"/creative-services"');
  });

  it("escapes a value containing the quote character it would otherwise close on", async () => {
    await new ContentFileWriter()
      .apply([{ pointer: pointer(["question"], "faqBlock"), value: "ignored" }])
      .catch(() => undefined);

    await new ContentFileWriter().apply([
      {
        pointer: { file: FILE, symbol: "faqBlock", path: ["items", 0, "answer"] },
        value: 'Yes — we call it "UGC".',
      },
    ]);

    expect(read()).toContain(`'Yes — we call it "UGC".'`);
  });

  it("refuses a file outside the content directory", async () => {
    await expect(
      new ContentFileWriter().apply([
        { pointer: { file: "../../../package.json", symbol: "x", path: [] }, value: "no" },
      ]),
    ).rejects.toThrow(/outside src\/infrastructure\/content\/static/);
  });

  it("refuses a file inside the content directory that is not a content module", async () => {
    writeFileSync(join(projectRoot, CONTENT_ROOT, "slugify.ts"), "export const a = 1;\n", "utf8");

    await expect(
      new ContentFileWriter().apply([
        { pointer: { file: "slugify.ts", symbol: "a", path: [] }, value: "no" },
      ]),
    ).rejects.toThrow(/is not a content module/);
  });

  it("leaves the file untouched when a pointer no longer resolves", async () => {
    await expect(
      new ContentFileWriter().apply([{ pointer: pointer(["gone"]), value: "x" }]),
    ).rejects.toThrow(/does not resolve/);

    expect(read()).toBe(FIXTURE);
  });

  it("writes nothing at all when one edit in the batch is bad", async () => {
    await expect(
      new ContentFileWriter().apply([
        { pointer: pointer(["heading"]), value: "Would have worked" },
        { pointer: pointer(["gone"]), value: "x" },
      ]),
    ).rejects.toThrow();

    expect(read()).toBe(FIXTURE);
  });

  // services.content.ts has always had lines over the print width. A save must not
  // arrive as a thirty-line reformat of a file nobody asked to reformat.
  it("does not reformat a file Prettier would already rewrite", async () => {
    const unformatted = [
      "export const capabilities = [",
      '  { title: "Creative Design", description: "A description long enough that Prettier would split this line if it were ever asked to." },',
      "];",
      "",
    ].join("\n");
    writeFileSync(join(projectRoot, CONTENT_ROOT, FILE), unformatted, "utf8");

    await new ContentFileWriter().apply([
      {
        pointer: { file: FILE, symbol: "capabilities", path: [0, "title"] },
        value: "Creative Design & Layout",
      },
    ]);

    const after = read().split("\n");
    expect(after).toHaveLength(4);
    expect(after[1]).toContain('title: "Creative Design & Layout"');
  });

  it("re-wraps a longer replacement when the file was already formatted", async () => {
    await new ContentFileWriter().apply([
      {
        pointer: pointer(["heading"]),
        value:
          "A replacement heading long enough that it can no longer share a line with its own property name.",
      },
    ]);

    expect(read()).toMatch(/heading:\r?\n\s+"A replacement heading/);
  });

  it("leaves no temporary files behind", async () => {
    await new ContentFileWriter().apply([{ pointer: pointer(["heading"]), value: "Done." }]);

    const { readdirSync } = await import("node:fs");
    expect(readdirSync(join(projectRoot, CONTENT_ROOT))).toEqual([FILE]);
  });
});
