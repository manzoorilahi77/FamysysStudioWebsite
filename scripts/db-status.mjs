// Answers one question: can the machine this runs on reach the content database, and is
// there anything in it?
//
//   npm run db:status
//
// WHY THIS EXISTS. The seven public pages are prerendered, and they are prerendered FROM
// THE DATABASE — so the machine that runs `next build` needs network access to MySQL, not
// just the machine that serves the result. On a host where the database sits behind a
// firewall, or where the credentials were never copied into the deploy environment, the
// build does not fail: `withStaticFallback` catches the connection error and quietly
// builds the site from the TypeScript content modules instead. That is the right
// behaviour for a live site and the wrong thing to discover after a deploy, because the
// pages look almost right and none of the client's edits are on them.
//
// So this runs BEFORE a build, in the deploy documentation and by hand, and says plainly
// which of the two sources the next build is going to use.
//
// It prints host, port, database name, engine version and row counts. It never prints the
// user or the password, and the catch at the bottom never prints the driver's error
// object, which carries the whole connection config.

import mysql from "mysql2/promise";
import { loadEnv } from "./lib/loadEnv.mjs";

// The tables a seeded database has content in. Ordered as the seed writes them, so a
// partial seed reads as a prefix rather than as a scatter of zeroes.
const CONTENT_TABLES = [
  "pages",
  "page_sections",
  "content_strings",
  "case_studies",
  "capabilities",
  "process_steps",
  "engagement_tiers",
  "faq_items",
  "media_assets",
];

// Tables the site writes to rather than reads content from. Counted separately because a
// zero here is normal on a fresh install and a zero above is a broken one.
const OPERATIONAL_TABLES = ["inquiries", "login_attempts"];

loadEnv();

function credentials() {
  const missing = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"].filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    console.error(`Missing ${missing.join(", ")}.`);
    console.error("Copy .env.example to .env.local, or set them in the deploy environment.");
    process.exit(1);
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 10_000,
  };
}

async function countRows(connection, table) {
  try {
    const [[result]] = await connection.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
    return result.total;
  } catch (error) {
    // A missing table is a fact about the database, not a failure of this script: it means
    // the migrations have not been run here.
    if (error.code === "ER_NO_SUCH_TABLE") return undefined;
    throw error;
  }
}

async function main() {
  const config = credentials();
  const source = process.env.CONTENT_SOURCE ?? "database";

  console.log(`Host      ${config.host}:${config.port}`);
  console.log(`Database  ${config.database}`);
  console.log(`Source    CONTENT_SOURCE=${source}`);

  const startedAt = Date.now();
  let connection;
  try {
    connection = await mysql.createConnection(config);
  } catch (error) {
    console.error(`\nUNREACHABLE — ${error.code ?? "error"}: ${error.sqlMessage ?? error.message}`);
    console.error(
      "\nA build from this machine would fall back to the static content modules and\n" +
        "silently ship the site without the client's edits. Fix the connection first.",
    );
    process.exit(1);
  }
  console.log(`Reachable in ${Date.now() - startedAt} ms`);

  const [[server]] = await connection.query(
    "SELECT VERSION() AS version, @@version_comment AS edition",
  );
  console.log(`Engine    MySQL ${server.version} (${server.edition})`);

  const [applied] = await connection
    .query("SELECT version, name FROM schema_migrations ORDER BY version")
    .catch(() => [[]]);
  if (applied.length === 0) {
    console.log("\nNo migrations applied. Run `npm run db:migrate`.");
  } else {
    const last = applied[applied.length - 1];
    console.log(`Migrations ${applied.length} applied, latest ${last.version}_${last.name}`);
  }

  console.log("\nContent");
  let empty = 0;
  for (const table of CONTENT_TABLES) {
    const total = await countRows(connection, table);
    if (total === undefined) {
      console.log(`  ${table.padEnd(18)} —  table missing`);
      empty += 1;
    } else {
      if (total === 0) empty += 1;
      console.log(`  ${table.padEnd(18)} ${total}`);
    }
  }

  console.log("\nOperational");
  for (const table of OPERATIONAL_TABLES) {
    const total = await countRows(connection, table);
    console.log(`  ${table.padEnd(18)} ${total ?? "—  table missing"}`);
  }

  await connection.end();

  if (empty > 0) {
    console.log(
      `\n${empty} content table${empty === 1 ? " is" : "s are"} empty. Run \`npm run db:seed\`` +
        " before building, or the\nsite falls back to the static content modules.",
    );
    process.exit(1);
  }
  console.log("\nReady to build from the database.");
}

main().catch((error) => {
  console.error(`db:status failed: ${error.sqlMessage ?? error.message}`);
  process.exit(1);
});
