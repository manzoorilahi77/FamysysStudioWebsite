import { describe, expect, it, vi } from "vitest";
import { MissingConfigurationError } from "./env";
import { isDatabaseUnavailable, withStaticFallback } from "./fallback";

interface Reader {
  read(): Promise<string>;
}

function failing(error: unknown): Reader {
  return {
    read: () => Promise.reject(error),
  };
}

const files: Reader = { read: async () => "from the files" };

describe("what counts as the database being unavailable", () => {
  it("recognises the driver's connection failures", () => {
    for (const code of ["ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND", "PROTOCOL_CONNECTION_LOST"]) {
      expect(isDatabaseUnavailable(Object.assign(new Error("nope"), { code }))).toBe(true);
    }
  });

  it("recognises bad credentials and a missing schema, which are configuration rather than content", () => {
    for (const code of ["ER_ACCESS_DENIED_ERROR", "ER_BAD_DB_ERROR", "ER_NO_SUCH_TABLE"]) {
      expect(isDatabaseUnavailable(Object.assign(new Error("nope"), { code }))).toBe(true);
    }
  });

  it("recognises an unconfigured environment", () => {
    expect(isDatabaseUnavailable(new MissingConfigurationError(["DB_HOST"]))).toBe(true);
  });

  // The distinction the whole file exists for.
  it("does NOT treat a content error as the database being down", () => {
    expect(isDatabaseUnavailable(new Error('home:hero has no content field "heading".'))).toBe(
      false,
    );
    expect(
      isDatabaseUnavailable(Object.assign(new Error("bad row"), { code: "ER_PARSE_ERROR" })),
    ).toBe(false);
    expect(isDatabaseUnavailable(null)).toBe(false);
  });
});

describe("falling back to the content files", () => {
  it("uses the database when it answers", async () => {
    const database: Reader = { read: async () => "from the database" };

    await expect(withStaticFallback(database, files).read()).resolves.toBe("from the database");
  });

  it("uses the files when the database cannot be reached", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const unreachable = failing(Object.assign(new Error("nope"), { code: "ECONNREFUSED" }));

    await expect(withStaticFallback(unreachable, files).read()).resolves.toBe("from the files");
  });

  // A seeding bug that silently rendered last week's file would be the worst outcome here.
  it("lets a content error through rather than papering over it with a file", async () => {
    const broken = failing(new Error('home:hero has no content field "heading".'));

    await expect(withStaticFallback(broken, files).read()).rejects.toThrow("no content field");
  });

  it("says so once rather than once per read", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const unreachable = failing(Object.assign(new Error("nope"), { code: "ENOTFOUND" }));
    const reader = withStaticFallback(unreachable, files);

    await reader.read();
    await reader.read();
    await reader.read();

    // The module reports once per process; other tests in this file may have tripped it
    // first, so the assertion is that it did not report three more times.
    expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
  });
});
