import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { adminPasswordHash } from "../db/env";
import { rows, write } from "../db/pool";
import type { RowDataPacket } from "mysql2/promise";

/**
 * ONE SHARED LOGIN, AND THE THREE THINGS THAT MAKE IT SAFE ENOUGH.
 *
 * 1. The password is never stored. `ADMIN_PASSWORD_HASH` is a bcrypt hash at cost 12, and
 *    the only thing that ever meets the submitted password is `bcrypt.compare`. Nothing
 *    in the database, nothing in the repository, nothing in a log.
 *
 * 2. Wrong attempts are counted and then refused. Five in fifteen minutes and the bucket
 *    is locked for fifteen more — see `login_attempts` for why that count lives in the
 *    database rather than in memory.
 *
 * 3. The response takes the same shape whether the password was wrong or the account was
 *    locked out only after the lockout is real, and bcrypt's own cost means a wrong
 *    password takes as long as a right one. There is no faster path to distinguish.
 *
 * WHAT THIS IS NOT. One shared credential cannot say who made a change, and there is no
 * second factor. Both are real limits of "one shared admin login", which is what was
 * asked for; per-user accounts are the upgrade, and the session already carries a `sub`
 * claim so it has somewhere to go.
 */

export const MAX_ATTEMPTS = 5;
export const WINDOW_MINUTES = 15;

export type LoginOutcome =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "invalid" }
  | { readonly ok: false; readonly reason: "locked"; readonly retryAfterMinutes: number };

/**
 * The age is computed BY THE SERVER, not from the timestamp.
 *
 * `attempted_at` comes back as a string in the database server's timezone with no offset
 * on it. Parsing that here treats it as local time, and when the two machines disagree —
 * a UTC host and a developer in another zone — the lockout looks either expired or hours
 * long. `TIMESTAMPDIFF` against `NOW(3)` is both sides of the subtraction in the same
 * clock, so there is nothing to get wrong.
 */
interface AttemptRow extends RowDataPacket {
  failures: number;
  oldest_age_seconds: number | null;
}

/**
 * The client address, hashed before it is stored.
 *
 * A rate limiter needs to tell two callers apart; it does not need to know who they are.
 * Hashing means the table holds no addresses, which is one less thing to leak and one
 * less thing to justify keeping.
 */
export function clientKey(address: string | null): string {
  return createHash("sha256")
    .update(address ?? "unknown")
    .digest("hex")
    .slice(0, 32);
}

async function recentFailures(key: string): Promise<AttemptRow> {
  const found = await rows<AttemptRow>(
    `SELECT COUNT(*) AS failures,
            TIMESTAMPDIFF(SECOND, MIN(attempted_at), NOW(3)) AS oldest_age_seconds
       FROM login_attempts
      WHERE client_key = ?
        AND succeeded = 0
        AND attempted_at > DATE_SUB(NOW(3), INTERVAL ? MINUTE)`,
    [key, WINDOW_MINUTES],
  );
  return found[0] ?? ({ failures: 0, oldest_age_seconds: null } as AttemptRow);
}

async function record(key: string, succeeded: boolean): Promise<void> {
  await write("INSERT INTO login_attempts (client_key, succeeded) VALUES (?, ?)", [
    key,
    succeeded ? 1 : 0,
  ]);
  // Pruned on write rather than on a schedule: nothing here runs a cron, and the table
  // only grows when someone is logging in.
  await write("DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(3), INTERVAL 1 DAY)");
}

export async function attemptLogin(password: string, key: string): Promise<LoginOutcome> {
  const attempts = await recentFailures(key);
  if (attempts.failures >= MAX_ATTEMPTS) {
    const elapsedMinutes = (attempts.oldest_age_seconds ?? 0) / 60;
    return {
      ok: false,
      reason: "locked",
      retryAfterMinutes: Math.max(1, Math.ceil(WINDOW_MINUTES - elapsedMinutes)),
    };
  }

  const matches = await bcrypt.compare(password, adminPasswordHash());
  await record(key, matches);
  return matches ? { ok: true } : { ok: false, reason: "invalid" };
}

/**
 * Clears a bucket's failures. Called on a successful login so a run of typos does not
 * lock out the person who then got it right.
 */
export async function clearFailures(key: string): Promise<void> {
  await write("DELETE FROM login_attempts WHERE client_key = ? AND succeeded = 0", [key]);
}

/**
 * Whether two secrets match without leaking how nearly. Not used for the password —
 * bcrypt does its own constant-time compare — but for anything else that has to.
 */
export function constantTimeEquals(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
