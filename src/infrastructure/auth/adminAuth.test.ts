import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

/**
 * REAL BCRYPT, A FAKE TABLE.
 *
 * `bcrypt.compare` is NOT mocked — that is the one line in this file a security review
 * actually needs proof of, so it runs for real against a real hash. What is faked is
 * `login_attempts`, an in-memory array standing in for the two statements `adminAuth.ts`
 * sends it (count recent failures, insert an attempt), so the lockout counting is exercised
 * against real accumulating state rather than assumed from reading the SQL.
 *
 * Cost factor 4, not the production 12 — cost changes how long `bcrypt.compare` takes, not
 * what it does; running fifty comparisons at cost 12 in a test file would make the suite
 * slow for a property this shape of test does not need.
 */
// allow-secret: test fixture — a well-known example phrase, not the admin password
const TEST_PASSWORD = "correct horse battery staple";
const TEST_HASH = bcrypt.hashSync(TEST_PASSWORD, 4);

interface AttemptRow {
  client_key: string;
  succeeded: boolean;
  attempted_at: number;
}

let table: AttemptRow[] = [];
const now = () => Date.now();

vi.mock("../db/pool", () => ({
  rows: vi.fn(async (sql: string, params: ReadonlyArray<unknown>) => {
    if (sql.includes("COUNT(*)")) {
      const [key, windowMinutes] = params as [string, number];
      const cutoff = now() - Number(windowMinutes) * 60_000;
      const matching = table.filter(
        (row) => row.client_key === key && !row.succeeded && row.attempted_at > cutoff,
      );
      const oldest = matching.reduce(
        (min, row) => Math.min(min, row.attempted_at),
        Number.POSITIVE_INFINITY,
      );
      return [
        {
          failures: matching.length,
          oldest_age_seconds: matching.length > 0 ? (now() - oldest) / 1000 : null,
        },
      ];
    }
    throw new Error(`adminAuth.test.ts fake pool: unexpected rows() query: ${sql}`);
  }),
  write: vi.fn(async (sql: string, params: ReadonlyArray<unknown>) => {
    if (sql.startsWith("INSERT INTO login_attempts")) {
      const [key, succeeded] = params as [string, number];
      table.push({ client_key: key, succeeded: succeeded === 1, attempted_at: now() });
      return;
    }
    if (sql.includes("DELETE FROM login_attempts WHERE client_key")) {
      const [key] = params as [string];
      table = table.filter((row) => !(row.client_key === key && !row.succeeded));
      return;
    }
    if (sql.startsWith("DELETE FROM login_attempts WHERE attempted_at")) {
      return; // pruning old rows; nothing in these tests is old enough to matter
    }
    throw new Error(`adminAuth.test.ts fake pool: unexpected write() query: ${sql}`);
  }),
}));

const { attemptLogin, clearFailures, MAX_ATTEMPTS, clientKey } = await import("./adminAuth");

beforeEach(() => {
  table = [];
  // allow-secret: test fixture — the hash of TEST_PASSWORD above, set for this process only
  process.env.ADMIN_PASSWORD_HASH = TEST_HASH;
});

describe("attemptLogin", () => {
  it("succeeds against the correct password, real bcrypt comparison", async () => {
    const outcome = await attemptLogin(TEST_PASSWORD, "key-a");
    expect(outcome).toEqual({ ok: true });
  });

  it("fails against a wrong password with a generic 'invalid' reason", async () => {
    const outcome = await attemptLogin("not the password", "key-b");
    expect(outcome).toEqual({ ok: false, reason: "invalid" });
  });

  it("fails identically for every wrong password tried — no oracle on the value", async () => {
    const attempts = ["", "a", "correct horse battery staple ", "CORRECT HORSE BATTERY STAPLE", "🔒"];
    for (const [index, guess] of attempts.entries()) {
       
      const outcome = await attemptLogin(guess, `key-c-${index}`);
      expect(outcome).toEqual({ ok: false, reason: "invalid" });
    }
  });

  it(`locks out after ${MAX_ATTEMPTS} wrong attempts from the same key`, async () => {
    const key = "key-lockout";
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
       
      const outcome = await attemptLogin("wrong", key);
      expect(outcome).toEqual({ ok: false, reason: "invalid" });
    }

    const locked = await attemptLogin("wrong", key);
    expect(locked.ok).toBe(false);
    expect((locked as { reason: string }).reason).toBe("locked");

    // The correct password does not get a bypass once the bucket is locked — this is the
    // exact property that makes a lockout real rather than advisory.
    const stillLocked = await attemptLogin(TEST_PASSWORD, key);
    expect(stillLocked.ok).toBe(false);
    expect((stillLocked as { reason: string }).reason).toBe("locked");
  });

  it("keeps buckets independent — a lockout on one key never blocks another", async () => {
    const key = "key-isolated";
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
       
      await attemptLogin("wrong", key);
    }

    const otherKey = await attemptLogin(TEST_PASSWORD, "a-different-key");
    expect(otherKey).toEqual({ ok: true });
  });

  it("clearFailures lets a correct password after typos succeed without waiting out the window", async () => {
    const key = "key-recovers";
    await attemptLogin("typo one", key);
    await attemptLogin("typo two", key);
    await clearFailures(key);

    // Two more wrong attempts after clearing should not combine with the pre-clear ones
    // to trip the lock — clearFailures is what a successful login calls.
    await attemptLogin("typo three", key);
    const outcome = await attemptLogin(TEST_PASSWORD, key);
    expect(outcome).toEqual({ ok: true });
  });
});

describe("clientKey", () => {
  it("hashes the address rather than storing it, and is deterministic for the same input", () => {
    const a = clientKey("203.0.113.7");
    const b = clientKey("203.0.113.7");
    expect(a).toBe(b);
    expect(a).not.toContain("203.0.113.7");
  });

  it("gives different addresses different keys", () => {
    expect(clientKey("203.0.113.7")).not.toBe(clientKey("203.0.113.8"));
  });
});
