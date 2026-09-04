import mysql from "mysql2/promise";
import type { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { databaseCredentials } from "./env";

/**
 * ONE POOL PER PROCESS, AND EVERY QUERY GOES THROUGH IT.
 *
 * A pool rather than a connection because the panel and the contact form are request
 * handlers: a connection per request against a host that allows 150 of them would run out
 * during an ordinary crawl, and opening one per query adds a TCP and auth round trip to
 * every read. `connectionLimit` is deliberately small — this is one small site sharing a
 * shared-hosting server, not the only tenant on it.
 *
 * The module-level cache survives Next's dev-server hot reloads through `globalThis`.
 * Without it every edit to a repository would leak a pool, and the host would refuse
 * connections after an afternoon's work.
 *
 * PARAMETERISED QUERIES ONLY. `execute` sends the SQL and the values separately, so a
 * value can never be read as syntax. Nothing in this file, and nothing that calls it,
 * builds SQL by concatenating a value in — see `sql` below for the one place where a
 * fragment is assembled, and what it is allowed to contain.
 */

type GlobalWithPool = typeof globalThis & { __famysysPool?: Pool };

function create(): Pool {
  const credentials = databaseCredentials();
  return mysql.createPool({
    host: credentials.host,
    port: credentials.port,
    user: credentials.user,
    password: credentials.password,
    database: credentials.database,
    waitForConnections: true,
    connectionLimit: 6,
    maxIdle: 2,
    // Shared hosting closes idle connections itself; releasing first avoids handing a
    // dead socket to the next request.
    idleTimeout: 60_000,
    // Unbounded: a build renders every page at once and the panel builds its whole read
    // model, so short bursts of well over thirty waiters are normal. Refusing one is a
    // failed page; waiting a few milliseconds for a connection is not.
    queueLimit: 0,
    connectTimeout: 10_000,
    // The schema default is utf8mb3. Every table this project creates declares utf8mb4,
    // and so does the connection, so a character outside the BMP round-trips rather than
    // being rejected by the server.
    charset: "utf8mb4_unicode_ci",
    // Dates come back as strings and are turned into Date objects by the repositories
    // that know the column. The driver's own conversion applies the SERVER's timezone to
    // a value that has none, which silently shifts a timestamp by the host's offset.
    dateStrings: true,
    namedPlaceholders: false,
    supportBigNumbers: true,
    bigNumberStrings: false,
  });
}

/**
 * EVERY CONNECTION SPEAKS UTC.
 *
 * A DATETIME carries no offset, so a timestamp written by the database and read by Node
 * is only meaningful if both agree which clock it is in. They do not by default: the host
 * is UTC and a developer's machine is not, and the difference showed up as a lockout that
 * had apparently already expired the moment it began. Pinning the session timezone makes
 * the stored value UTC on the way in and on the way out, and `toDate` reads it as UTC.
 */
function pinToUtc(pool: Pool): Pool {
  pool.on("connection", (connection) => {
    connection.query("SET time_zone = '+00:00'");
  });
  return pool;
}

export function pool(): Pool {
  const scope = globalThis as GlobalWithPool;
  scope.__famysysPool ??= pinToUtc(create());
  return scope.__famysysPool;
}

/** Closes the pool. For scripts and tests — a request handler must never call this. */
export async function closePool(): Promise<void> {
  const scope = globalThis as GlobalWithPool;
  if (scope.__famysysPool) {
    const open = scope.__famysysPool;
    delete scope.__famysysPool;
    await open.end();
  }
}

/**
 * What may be sent as a query parameter. Deliberately narrow: an object or an array here
 * would be serialised by the driver in a way nobody intended, and `undefined` is sent as
 * DEFAULT rather than NULL — which writes something other than what was meant, silently.
 */
export type SqlValue = string | number | boolean | Date | null;

/** Rows from a SELECT, typed by the caller against the columns it asked for. */
export async function rows<T extends RowDataPacket>(
  sql: string,
  values: ReadonlyArray<SqlValue> = [],
): Promise<T[]> {
  const [result] = await pool().execute<T[]>(sql, [...values]);
  return result;
}

/** The first row, or undefined. */
export async function row<T extends RowDataPacket>(
  sql: string,
  values: ReadonlyArray<SqlValue> = [],
): Promise<T | undefined> {
  const found = await rows<T>(sql, values);
  return found[0];
}

/** An INSERT, UPDATE or DELETE. Returns the header so a caller can read affectedRows. */
export async function write(
  sql: string,
  values: ReadonlyArray<SqlValue> = [],
): Promise<ResultSetHeader> {
  const [result] = await pool().execute<ResultSetHeader>(sql, [...values]);
  return result;
}

/**
 * Runs `work` inside a transaction, on one connection, and rolls back if it throws.
 *
 * Anything that writes more than one row uses this. A record's strings are written
 * together or not at all, for the same reason `SaveCmsRecord` validates the whole record
 * before writing any of it: a half-saved record is the state an editor is least able to
 * reason about.
 */
export async function transaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error: unknown) {
    // A rollback failure must not replace the error that caused it — that one is the
    // one worth reporting.
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * A placeholder list for an IN clause: `placeholders(3)` is "?,?,?".
 *
 * This is the ONLY dynamic SQL in the project, and it is dynamic in its SHAPE rather than
 * its content — it emits question marks and nothing else, so no caller can push a value
 * into the statement through it. An empty list would produce `IN ()`, which is a syntax
 * error, so callers check for the empty case before they ask.
 */
export function placeholders(count: number): string {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("placeholders() needs a positive integer.");
  }
  return new Array(count).fill("?").join(",");
}

/**
 * Whether the database answers at all.
 *
 * Used by the composition root to decide between the database repositories and the static
 * ones. It resolves to false rather than throwing, because "the database is down" is a
 * condition the site is designed to survive, not an exception.
 */
export async function isReachable(): Promise<boolean> {
  try {
    await rows<RowDataPacket>("SELECT 1 AS ok");
    return true;
  } catch {
    return false;
  }
}
