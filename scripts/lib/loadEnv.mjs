// Loads .env.local into process.env for scripts run outside Next.
//
// Next reads .env.local by itself; `node scripts/db-migrate.mjs` does not, and asking
// whoever runs a migration to export five variables first is how a migration gets run
// against the wrong database.
//
// Precedence: an already-set variable WINS. That is what makes
// `DB_NAME=famysys_test npm run db:migrate` work, and it is the behaviour Next has, so
// the two cannot disagree about which database a command reached.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** `KEY=value`, with optional surrounding quotes and a trailing comment. */
function parse(text) {
  const values = new Map();
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.endsWith(quote) && value.length > 1) {
      value = value.slice(1, -1);
    }
    if (key !== "") values.set(key, value);
  }
  return values;
}

/** Returns the names it set, so a caller can say what it found without saying what it read. */
export function loadEnv(file = ".env.local") {
  const absolute = path.join(ROOT, file);
  if (!existsSync(absolute)) return [];

  const applied = [];
  for (const [key, value] of parse(readFileSync(absolute, "utf8"))) {
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
      applied.push(key);
    }
  }
  return applied;
}

export { ROOT };
