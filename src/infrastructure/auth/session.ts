import { createHmac, timingSafeEqual } from "node:crypto";
import { sessionSecret } from "../db/env";

/**
 * THE SESSION COOKIE, AND WHY IT IS SIGNED RATHER THAN LOOKED UP.
 *
 * There is one account. A session table would be a table with one meaningful row in it
 * and a second round trip on every page of the panel, to answer a question a signature
 * already answers. So the cookie carries its own claims and an HMAC over them: the server
 * can verify it without storing anything, and cannot be lied to without SESSION_SECRET.
 *
 * What that costs is revocation — a stolen cookie stays valid until it expires. Rotating
 * SESSION_SECRET invalidates every session at once, which is the answer, and it is worth
 * saying plainly rather than discovering later.
 *
 * The payload holds no secret. It is signed, not encrypted: anyone holding the cookie can
 * read "admin" and two timestamps, and none of that is worth hiding. What they cannot do
 * is change them.
 *
 * `timingSafeEqual` rather than `===` because a comparison that returns early leaks, one
 * byte at a time, how much of a forged signature was right.
 */

export const SESSION_COOKIE = "famysys_admin_session";

/** Eight hours: long enough for a working day, short enough that a forgotten tab expires. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

interface SessionClaims {
  readonly sub: string;
  /** Issued at, seconds since the epoch. */
  readonly iat: number;
  /** Expires at, seconds since the epoch. */
  readonly exp: number;
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function issueSession(now: Date = new Date()): string {
  const issuedAt = Math.floor(now.getTime() / 1000);
  const claims: SessionClaims = {
    sub: "admin",
    iat: issuedAt,
    exp: issuedAt + SESSION_MAX_AGE_SECONDS,
  };
  const payload = encode(JSON.stringify(claims));
  return `${payload}.${sign(payload)}`;
}

/**
 * True only for a token this server signed and that has not expired. Every failure path
 * returns false rather than throwing: a malformed cookie is a request without a session,
 * not an error worth a stack trace, and an attacker learns nothing from either.
 */
export function isValidSession(token: string | undefined, now: Date = new Date()): boolean {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const provided = Buffer.from(token.slice(separator + 1), "base64url");
  const expected = Buffer.from(sign(payload), "base64url");

  if (provided.length !== expected.length) return false;
  if (!timingSafeEqual(provided, expected)) return false;

  let claims: SessionClaims;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionClaims;
  } catch {
    return false;
  }

  if (claims.sub !== "admin") return false;
  return typeof claims.exp === "number" && claims.exp * 1000 > now.getTime();
}

/** The attributes the cookie is set with, in one place so login and logout cannot differ. */
export function sessionCookieOptions(maxAge: number): {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    // Not readable from JavaScript, so an injected script cannot lift it.
    httpOnly: true,
    // HTTPS only in production. Left off in development because localhost is not served
    // over TLS and a secure cookie there would simply never be set.
    secure: process.env.NODE_ENV === "production",
    // Blocks the cookie from riding along on a cross-site POST, which is what would make
    // the save endpoint forgeable from another origin.
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}
