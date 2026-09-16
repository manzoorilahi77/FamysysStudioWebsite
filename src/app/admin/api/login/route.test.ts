import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * THE ENUMERATION QUESTION, EMPIRICALLY.
 *
 * There is no username field anywhere in this system — one shared admin credential, no
 * account identifier at all (see the comment at the top of route.ts). So "does the
 * username path leak differently from the password path" has no separate code path to
 * test: there is exactly one input (`password`) and exactly one comparison. What this file
 * proves instead, by actually calling `POST` rather than reading the code and reasoning
 * about it, is the property that matters given that shape: the response for a WRONG
 * password is byte-identical no matter what the wrong password is, across a spread of
 * inputs chosen to be the kind of thing an attacker would try to get a different answer
 * out of (empty, whitespace, the right password with different casing, unicode, the right
 * password with a trailing character). `adminAuth.test.ts` already proves the bcrypt
 * comparison and the lockout counting are correct with a real hash; this file proves the
 * ROUTE built on top of them never lets a caller distinguish "wrong" from "wrong how".
 */
const attemptLogin = vi.fn();
const clearFailures = vi.fn(async () => undefined);
const clientKey = vi.fn((address: string | null) => `key:${address ?? "unknown"}`);

vi.mock("../../../../infrastructure/auth/adminAuth", () => ({
  MAX_ATTEMPTS: 5,
  WINDOW_MINUTES: 15,
  attemptLogin,
  clearFailures,
  clientKey,
}));

const cookieSet = vi.fn();
vi.mock("../../../../infrastructure/auth/session", () => ({
  SESSION_COOKIE: "fs_admin_session",
  SESSION_MAX_AGE_SECONDS: 28_800,
  issueSession: () => "fake-session-token",
  sessionCookieOptions: () => ({ httpOnly: true }),
}));

let headerBox = new Headers();
vi.mock("next/headers", () => ({
  headers: async () => headerBox,
  cookies: async () => ({ set: cookieSet }),
}));

const { POST } = await import("./route");

function loginRequest(body: unknown): Request {
  return new Request("http://localhost/admin/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  attemptLogin.mockReset();
  clearFailures.mockClear();
  clientKey.mockClear();
  cookieSet.mockClear();
  headerBox = new Headers();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /admin/api/login — no enumeration channel", () => {
  const WRONG_GUESSES = [
    "",
    "a",
    "wrong password entirely",
    "CorrectPassword", // right word, wrong case
    "correctpassword ", // right word, trailing space
    "🔒🔑",
    "' OR '1'='1",
  ];

  it.each(WRONG_GUESSES)("returns the identical 401 body for a wrong password (%j)", async (guess) => {
    attemptLogin.mockResolvedValue({ ok: false, reason: "invalid" });

    const response = await POST(loginRequest({ password: guess }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      message: "That password is not right. 5 wrong attempts locks sign-in for 15 minutes.",
    });
  });

  it("every wrong-password response is byte-identical to every other, across all tried guesses", async () => {
    attemptLogin.mockResolvedValue({ ok: false, reason: "invalid" });

    const bodies = await Promise.all(
      WRONG_GUESSES.map(async (guess) => {
        const response = await POST(loginRequest({ password: guess }));
        return JSON.stringify(await response.json());
      }),
    );

    const distinct = new Set(bodies);
    expect(distinct.size).toBe(1);
  });

  it("never calls attemptLogin with anything but the exact submitted string — no server-side normalization creates a second oracle", async () => {
    attemptLogin.mockResolvedValue({ ok: false, reason: "invalid" });

    await POST(loginRequest({ password: "MiXeD CaSe Guess" }));

    expect(attemptLogin).toHaveBeenCalledWith("MiXeD CaSe Guess", expect.any(String));
  });

  it("returns 200 and sets the session cookie only for the one outcome that is actually correct", async () => {
    attemptLogin.mockResolvedValue({ ok: true });

    const response = await POST(loginRequest({ password: "the real password" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(cookieSet).toHaveBeenCalledWith("fs_admin_session", "fake-session-token", {
      httpOnly: true,
    });
    expect(clearFailures).toHaveBeenCalled();
  });

  it("returns 400 for a missing password without ever reaching attemptLogin — same message shape, no account concept leaks either", async () => {
    const response = await POST(loginRequest({}));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, message: "Enter the password." });
    expect(attemptLogin).not.toHaveBeenCalled();
  });

  it("the locked-out response is distinct from the wrong-password response — a rate-limit signal, not a credential oracle", async () => {
    attemptLogin.mockResolvedValue({ ok: false, reason: "locked", retryAfterMinutes: 7 });

    const response = await POST(loginRequest({ password: "doesn't matter which" }));
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.message).toBe("Too many attempts. Try again in 7 minutes.");
    // It says nothing about whether THIS password was right — locked-out is returned
    // before the password is even compared (see adminAuth.attemptLogin).
    expect(body.message).not.toMatch(/password/i);
  });
});

describe("POST /admin/api/login — client key derivation (X-Forwarded-For bypass fix)", () => {
  it("keys the rate limiter on the LAST X-Forwarded-For entry, not the client-suppliable first one", async () => {
    attemptLogin.mockResolvedValue({ ok: false, reason: "invalid" });
    headerBox.set("x-forwarded-for", "203.0.113.7, 10.0.0.1");

    await POST(loginRequest({ password: "wrong" }));

    expect(clientKey).toHaveBeenCalledWith("10.0.0.1");
    expect(clientKey).not.toHaveBeenCalledWith("203.0.113.7");
  });

  it("an attacker prepending fake hops still resolves to the one address mod_proxy appended", async () => {
    attemptLogin.mockResolvedValue({ ok: false, reason: "invalid" });
    headerBox.set(
      "x-forwarded-for",
      "1.1.1.1, 2.2.2.2, 3.3.3.3, 203.0.113.7, 10.0.0.1",
    );

    await POST(loginRequest({ password: "wrong" }));

    expect(clientKey).toHaveBeenCalledWith("10.0.0.1");
  });

  it("falls back to x-real-ip when there is no x-forwarded-for at all", async () => {
    attemptLogin.mockResolvedValue({ ok: false, reason: "invalid" });
    headerBox.set("x-real-ip", "198.51.100.2");

    await POST(loginRequest({ password: "wrong" }));

    expect(clientKey).toHaveBeenCalledWith("198.51.100.2");
  });
});
