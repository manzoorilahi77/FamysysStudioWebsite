import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  isValidSession,
  issueSession,
  sessionCookieOptions,
} from "./session";

const SECRET = "a-test-secret-that-is-long-enough-to-pass-the-check";

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the admin session token", () => {
  it("accepts a token it issued", () => {
    expect(isValidSession(issueSession())).toBe(true);
  });

  it("rejects nothing at all", () => {
    expect(isValidSession(undefined)).toBe(false);
    expect(isValidSession("")).toBe(false);
  });

  it("rejects a token with a tampered payload", () => {
    const [payload, signature] = issueSession().split(".");
    const forged = Buffer.from(
      JSON.stringify({ sub: "admin", iat: 0, exp: 9_999_999_999 }),
      "utf8",
    ).toString("base64url");

    expect(payload).not.toBe(forged);
    expect(isValidSession(`${forged}.${signature}`)).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    const issued = issueSession();
    vi.stubEnv("SESSION_SECRET", "a-completely-different-secret-of-the-same-length!!");

    expect(isValidSession(issued)).toBe(false);
  });

  it("rejects a token that has expired", () => {
    const issued = issueSession(new Date("2026-01-01T00:00:00Z"));
    const justAfter = new Date(
      Date.parse("2026-01-01T00:00:00Z") + (SESSION_MAX_AGE_SECONDS + 1) * 1000,
    );

    expect(isValidSession(issued, new Date("2026-01-01T07:00:00Z"))).toBe(true);
    expect(isValidSession(issued, justAfter)).toBe(false);
  });

  it("rejects a token whose subject is not the admin", () => {
    // The claims are readable but not writable — this is the check that says so.
    const payload = Buffer.from(
      JSON.stringify({ sub: "someone-else", iat: 0, exp: 9_999_999_999 }),
      "utf8",
    ).toString("base64url");

    expect(isValidSession(`${payload}.not-a-signature`)).toBe(false);
  });

  it("rejects a malformed token rather than throwing", () => {
    for (const candidate of ["nodot", ".", "a.b.c", "!!!.???"]) {
      expect(() => isValidSession(candidate)).not.toThrow();
      expect(isValidSession(candidate)).toBe(false);
    }
  });
});

describe("the session cookie's attributes", () => {
  it("is httpOnly and sameSite lax, so script cannot read it and cross-site POSTs cannot send it", () => {
    const options = sessionCookieOptions(SESSION_MAX_AGE_SECONDS);

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  it("is secure in production and not in development, where there is no TLS to be secure over", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(sessionCookieOptions(1).secure).toBe(true);

    vi.stubEnv("NODE_ENV", "development");
    expect(sessionCookieOptions(1).secure).toBe(false);
  });
});
