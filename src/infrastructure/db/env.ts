/**
 * THE ONLY PLACE THE PROCESS ENVIRONMENT IS READ.
 *
 * Every credential arrives through here, is checked once, and is handed on as a typed
 * object. Nothing else in the codebase reads `process.env` for a secret, which is what
 * makes "is this configured?" a question with one answer rather than a stack trace from
 * whichever module happened to need it first.
 *
 * Nothing here ever puts a value into a message. A missing variable is reported by NAME;
 * a malformed one is reported as malformed. Error messages get pasted into issues, and a
 * password in one is a password that has been published.
 */

export type ContentSource = "database" | "static";

export interface DatabaseCredentials {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly user: string;
  readonly password: string;
}

export class MissingConfigurationError extends Error {
  readonly names: ReadonlyArray<string>;

  constructor(names: ReadonlyArray<string>) {
    super(
      `Missing environment variable${names.length === 1 ? "" : "s"}: ${names.join(", ")}. ` +
        "Copy .env.example to .env.local and fill them in.",
    );
    this.name = "MissingConfigurationError";
    this.names = names;
  }
}

/** Absent and empty are the same thing here: an unset variable in a .env file is "". */
function read(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? undefined : value;
}

function required(name: string, missing: string[]): string {
  const value = read(name);
  if (value === undefined) {
    missing.push(name);
    return "";
  }
  return value;
}

function assertNoneMissing(missing: ReadonlyArray<string>): void {
  if (missing.length > 0) {
    throw new MissingConfigurationError(missing);
  }
}

const DATABASE_VARIABLES = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"] as const;

export function databaseCredentials(): DatabaseCredentials {
  const missing: string[] = [];
  const host = required("DB_HOST", missing);
  const database = required("DB_NAME", missing);
  const user = required("DB_USER", missing);
  const password = required("DB_PASSWORD", missing);
  assertNoneMissing(missing);

  const port = Number(read("DB_PORT") ?? "3306");
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("DB_PORT is not a valid port number.");
  }
  return { host, port, database, user, password };
}

export function hasDatabaseCredentials(): boolean {
  return DATABASE_VARIABLES.every((name) => read(name) !== undefined);
}

export function sessionSecret(): string {
  const missing: string[] = [];
  const secret = required("SESSION_SECRET", missing);
  assertNoneMissing(missing);
  // Below this a signature is guessable offline, and a forged cookie is a logged-in
  // stranger. The generator in .env.example produces 64 characters.
  if (secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters. Generate a new one.");
  }
  return secret;
}

export function adminPasswordHash(): string {
  const missing: string[] = [];
  const hash = required("ADMIN_PASSWORD_HASH", missing);
  assertNoneMissing(missing);
  if (!/^\$2[aby]\$\d{2}\$/.test(hash)) {
    throw new Error(
      "ADMIN_PASSWORD_HASH is not a bcrypt hash — it must start with $2a$, $2b$ or $2y$. " +
        "See the generator command in .env.example. Never put the password itself here.",
    );
  }
  return hash;
}

/**
 * Which repositories the site reads through.
 *
 * The default is "database". "static" reads the TypeScript modules under
 * infrastructure/content/static instead, and is both a deliberate setting and what the
 * composition root falls back to on its own when the database cannot be reached.
 */
export function contentSource(): ContentSource {
  const raw = read("CONTENT_SOURCE")?.toLowerCase();
  if (raw === undefined || raw === "database") return "database";
  if (raw === "static") return "static";
  throw new Error(`CONTENT_SOURCE must be "database" or "static", not "${raw}".`);
}
