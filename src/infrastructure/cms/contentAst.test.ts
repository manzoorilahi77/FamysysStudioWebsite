import { describe, expect, it } from "vitest";
import { ContentPathError, locateLiteral, parseContent, toStringLiteral } from "./contentAst";

const FILE = "fixture.content.ts";

const SOURCE = `
// A leading comment.
const HELPER = (label: string, href: string) => ({ label, href });

/** A block comment on the export. */
export const page = {
  hero: {
    // TODO(client): expanded copy — draft, pending approval.
    heading: "A heading",
    cta: HELPER("Talk to us", "/contact"),
  },
  items: [
    { title: "First" },
    { title: "Second" },
  ],
  keyed: {
    "Creative Design": { copy: "Quoted key" },
  },
  derived: items.map((item) => item.title),
} as const;

function build() {
  return { inner: "From a function body" };
}
`;

function locate(path: ReadonlyArray<string | number>, symbol = "page") {
  return locateLiteral(parseContent(FILE, SOURCE), { file: FILE, symbol, path });
}

describe("locateLiteral", () => {
  it("walks object properties to a string literal", () => {
    expect(locate(["hero", "heading"]).text).toBe("A heading");
  });

  it("addresses call arguments by position, so a createCta label is reachable", () => {
    expect(locate(["hero", "cta", 0]).text).toBe("Talk to us");
    expect(locate(["hero", "cta", 1]).text).toBe("/contact");
  });

  it("addresses array elements by index", () => {
    expect(locate(["items", 1, "title"]).text).toBe("Second");
  });

  it("reads a quoted property key, which is how the drafted-copy records are keyed", () => {
    expect(locate(["keyed", "Creative Design", "copy"]).text).toBe("Quoted key");
  });

  it("sees through `as const` on the binding itself", () => {
    expect(locate(["hero", "heading"]).start).toBeGreaterThan(0);
  });

  it("resolves a top-level function through the expression it returns", () => {
    expect(locate(["inner"], "build").text).toBe("From a function body");
  });

  it("reports a value that is computed rather than written", () => {
    expect(() => locate(["derived", 0])).toThrow(ContentPathError);
    expect(() => locate(["derived", 0])).toThrow(/not a string literal/);
  });

  it("reports an unknown binding by name", () => {
    expect(() => locate(["heading"], "nope")).toThrow(/no top-level binding named "nope"/);
  });

  it("reports a path that runs out", () => {
    expect(() => locate(["hero", "missing"])).toThrow(/does not resolve/);
  });

  it("gives a span that covers the quotes, so a splice replaces the whole literal", () => {
    const located = locate(["hero", "heading"]);
    expect(SOURCE.slice(located.start, located.end)).toBe('"A heading"');
  });
});

describe("toStringLiteral", () => {
  it("uses double quotes, matching the repo's Prettier configuration", () => {
    expect(toStringLiteral("plain")).toBe('"plain"');
  });

  it("switches to single quotes when that means less escaping, as Prettier does", () => {
    expect(toStringLiteral('He said "yes"')).toBe(`'He said "yes"'`);
  });

  it("escapes the quote it chose, having chosen the one that needs fewer escapes", () => {
    // Two double quotes against one apostrophe, so single quoting is the cheaper literal.
    expect(toStringLiteral(`it's "both"`)).toBe(`'it\\'s "both"'`);
  });

  it("escapes backslashes before anything else", () => {
    expect(toStringLiteral("a\\b")).toBe('"a\\\\b"');
  });

  it("keeps curly quotes and em dashes verbatim — they are content, not syntax", () => {
    expect(toStringLiteral("What “scope” means — really")).toBe('"What “scope” means — really"');
  });
});
