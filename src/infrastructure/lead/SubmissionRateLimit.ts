/**
 * A CEILING ON ANONYMOUS SUBMISSIONS, PER CLIENT ADDRESS.
 *
 * The contact endpoint is world-reachable and every accepted submission now sends two
 * emails, one of them to an address the submitter chose. An open write endpoint with no
 * ceiling is a spam sink pointed at the studio's inbox and, through the acknowledgement,
 * at anyone else's. Five per address per ten minutes is well above honest use and low
 * enough to make scripted flooding pointless.
 *
 * IN MEMORY, DELIBERATELY, AND WHAT THAT COSTS. Counts are per process and reset on
 * restart. That is fine for a site that runs as ONE PM2 process in fork mode — see
 * deploy/ecosystem.config.js — and it keeps a database write off the path of every
 * submission. The moment a second instance exists this needs a shared store, the way
 * `login_attempts` is one for sign-in.
 *
 * The address comes from the LAST entry of `x-forwarded-for` — the hop Apache's mod_proxy
 * itself appends, not anything a client can prepend — the same reasoning the login route
 * states. A caller can still get a fresh bucket by submitting from a genuinely different
 * address, which no header trick closes: a brake on the careless rather than a wall
 * against the determined. Nothing here is persisted or logged.
 */

export const SUBMISSION_LIMIT = 5;
export const SUBMISSION_WINDOW_MS = 10 * 60 * 1000;
/** Past this many tracked clients, expired entries are swept so the map cannot grow forever. */
const SWEEP_THRESHOLD = 5_000;

export type RateDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly retryAfterSeconds: number };

export class SubmissionRateLimit {
  private readonly hits = new Map<string, ReadonlyArray<number>>();

  constructor(
    private readonly limit: number = SUBMISSION_LIMIT,
    private readonly windowMs: number = SUBMISSION_WINDOW_MS,
    private readonly now: () => number = Date.now,
  ) {}

  /** Records an attempt for `key` and says whether it is within the ceiling. */
  take(key: string): RateDecision {
    const now = this.now();
    if (this.hits.size > SWEEP_THRESHOLD) this.sweep(now);

    const recent = (this.hits.get(key) ?? []).filter((time) => now - time < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      const oldest = recent[0] ?? now;
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000)),
      };
    }
    this.hits.set(key, [...recent, now]);
    return { allowed: true };
  }

  private sweep(now: number): void {
    for (const [key, times] of this.hits) {
      if (times.every((time) => now - time >= this.windowMs)) this.hits.delete(key);
    }
  }
}

/** The client address as the proxy reports it; one shared bucket when it reports none. */
export function clientAddress(headers: Headers): string {
  const chain = headers.get("x-forwarded-for")?.split(",") ?? [];
  const forwarded = chain[chain.length - 1]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
