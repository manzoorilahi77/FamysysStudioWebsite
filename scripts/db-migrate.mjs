// Applies every unapplied file in db/migrations, in numeric order, once each.
//
//   npm run db:migrate            apply what is pending
//   npm run db:migrate -- --dry   list what would be applied, change nothing
//
// WHY A CHECKSUM. A migration that has been applied is history: the database already has
// its effect, and editing the file cannot un-apply it. The runner records a SHA-256 of
// each file it applies and refuses to continue when one no longer matches, because the
// alternative is a directory that describes a schema the database does not have and no
// way to notice. Fix a mistake with a NEW migration.
//
// Each file runs inside a transaction. MySQL commits DDL implicitly, so a file with two
// CREATE TABLEs that fails on the second leaves the first behind — hence every statement
// is written IF NOT EXISTS, so a re-run of a partly-applied file completes it rather than
// failing on what already succeeded.

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { loadEnv, ROOT } from "./lib/loadEnv.mjs";

const MIGRATIONS_DIR = path.join(ROOT, "db", "migrations");
const dryRun = process.argv.includes("--dry");

loadEnv();

function credentials() {
  const missing = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"].filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    console.error(`Missing ${missing.join(", ")}. Copy .env.example to .env.local.`);
    process.exit(1);
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    charset: "utf8mb4_unicode_ci",
  };
}

/** `003_content_strings.sql` -> { version: 3, name: "content_strings" }. */
function describe(file) {
  const match = /^(\d+)_(.+)\.sql$/.exec(file);
  if (!match) return undefined;
  return { file, version: Number(match[1]), name: match[2] };
}

function migrations() {
  const found = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith(".sql"))
    .map(describe)
    .filter(Boolean)
    .sort((a, b) => a.version - b.version);

  const seen = new Map();
  for (const migration of found) {
    const clash = seen.get(migration.version);
    if (clash) {
      console.error(
        `Two migrations share version ${migration.version}: ${clash} and ${migration.file}.`,
      );
      process.exit(1);
    }
    seen.set(migration.version, migration.file);
    migration.sql = readFileSync(path.join(MIGRATIONS_DIR, migration.file), "utf8");
    migration.checksum = createHash("sha256").update(migration.sql).digest("hex");
  }
  return found;
}

async function main() {
  const config = credentials();
  const connection = await mysql.createConnection(config);
  console.log(`Connected to ${config.database} on ${config.host}:${config.port}.`);

  const [[server]] = await connection.query("SELECT VERSION() AS version");
  console.log(`Server: MySQL ${server.version}`);

  const all = migrations();
  if (all.length === 0) {
    console.log("No migrations found.");
    await connection.end();
    return;
  }

  // The ledger is migration 001, so it has to exist before the ledger can be read.
  const ledger = all[0];
  if (ledger.version !== 1 || !ledger.sql.includes("schema_migrations")) {
    console.error("Migration 001 must create schema_migrations. Refusing to run.");
    process.exit(1);
  }
  await connection.query(ledger.sql);

  const [applied] = await connection.query(
    "SELECT version, name, checksum FROM schema_migrations ORDER BY version",
  );
  const appliedByVersion = new Map(applied.map((entry) => [entry.version, entry]));

  const drifted = all
    .filter((migration) => appliedByVersion.has(migration.version))
    .filter((migration) => appliedByVersion.get(migration.version).checksum !== migration.checksum);

  if (drifted.length > 0) {
    console.error("\nThese migrations changed after they were applied:\n");
    for (const migration of drifted) {
      console.error(`  ${migration.file}`);
    }
    console.error(
      "\nThe database already has their old effect and this runner cannot undo it.\n" +
        "Write a new migration for the change instead of editing an applied one.\n",
    );
    await connection.end();
    process.exit(1);
  }

  const pending = all.filter((migration) => !appliedByVersion.has(migration.version));
  if (pending.length === 0) {
    console.log(`Up to date — ${all.length} migration${all.length === 1 ? "" : "s"} applied.`);
    await connection.end();
    return;
  }

  if (dryRun) {
    console.log(`\nWould apply ${pending.length}:`);
    for (const migration of pending) console.log(`  ${migration.file}`);
    await connection.end();
    return;
  }

  for (const migration of pending) {
    const startedAt = Date.now();
    try {
      await connection.query(migration.sql);
    } catch (error) {
      console.error(`\n${migration.file} failed: ${error.sqlMessage ?? error.message}`);
      await connection.end();
      process.exit(1);
    }
    const duration = Date.now() - startedAt;
    await connection.execute(
      "INSERT INTO schema_migrations (version, name, checksum, duration_ms) VALUES (?, ?, ?, ?)",
      [migration.version, migration.name, migration.checksum, duration],
    );
    console.log(`  applied ${migration.file} (${duration} ms)`);
  }

  console.log(`\n${pending.length} migration${pending.length === 1 ? "" : "s"} applied.`);
  await connection.end();
}

main().catch((error) => {
  // Never the config object, and never the driver's own error object — the connection
  // config it carries includes the password.
  console.error(`Migration run failed: ${error.sqlMessage ?? error.message}`);
  process.exit(1);
});
