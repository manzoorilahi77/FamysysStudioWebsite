import { MissingConfigurationError } from "./env";

/**
 * "THE DATABASE IS DOWN" IS A CONDITION THE SITE SURVIVES. A SEEDING BUG IS NOT.
 *
 * The requirement was that the site still runs when the database is unreachable, and the
 * temptation is to wrap every read in a catch-all that falls back to the content files.
 * That would also swallow the errors worth having: a field the seed never wrote, a
 * collection that came back empty, a value object rejecting a stored string. Those are
 * bugs, they are fixable, and a site that quietly renders last year's file instead is a
 * site where nobody finds out.
 *
 * So the fallback is narrow. Only a failure to REACH or AUTHENTICATE against the database
 * hands over to the static repository; everything else propagates. The list below is
 * mysql2's own error codes plus the configuration error this layer raises itself.
 */

const UNAVAILABLE_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EPIPE",
  "PROTOCOL_CONNECTION_LOST",
  "PROTOCOL_SEQUENCE_TIMEOUT",
  "ER_CON_COUNT_ERROR",
  "ER_ACCESS_DENIED_ERROR",
  "ER_DBACCESS_DENIED_ERROR",
  "ER_BAD_DB_ERROR",
  // The tables are not there yet — a first run before `npm run db:migrate`.
  "ER_NO_SUCH_TABLE",
]);

export function isDatabaseUnavailable(error: unknown): boolean {
  if (error instanceof MissingConfigurationError) return true;
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && UNAVAILABLE_CODES.has(code);
}

/**
 * Reports the fall-back once per process rather than once per read, so a build against an
 * unreachable database produces one line that says so instead of forty identical ones.
 */
let reported = false;

function reportOnce(reason: unknown): void {
  if (reported) return;
  reported = true;
  const code = (reason as { code?: string } | null)?.code ?? "unknown";
  // Never the error object: mysql2 attaches the connection config, password included.
  console.warn(
    `[content] The database is unreachable (${code}). ` +
      "Falling back to the content files under src/infrastructure/content/static. " +
      "The site will render, but nothing edited in the admin panel will appear.",
  );
}

/**
 * Returns an object that calls `primary` and, only when the database is unavailable,
 * `secondary` instead. Both implement the same interface, so which one answered is
 * invisible to everything above.
 *
 * A Proxy rather than a hand-written wrapper per repository: there are eight of them with
 * twenty methods between them, and a wrapper that has to be updated when an interface
 * gains a method is a wrapper that will be forgotten.
 */
export function withStaticFallback<T extends object>(primary: T, secondary: T): T {
  return new Proxy(primary, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver) as unknown;
      if (typeof value !== "function") return value;

      return async (...args: unknown[]): Promise<unknown> => {
        try {
          return await (value as (...inner: unknown[]) => Promise<unknown>).apply(target, args);
        } catch (error: unknown) {
          if (!isDatabaseUnavailable(error)) throw error;
          reportOnce(error);
          const alternative = Reflect.get(secondary, property) as unknown;
          if (typeof alternative !== "function") throw error;
          return (alternative as (...inner: unknown[]) => Promise<unknown>).apply(secondary, args);
        }
      };
    },
  });
}
