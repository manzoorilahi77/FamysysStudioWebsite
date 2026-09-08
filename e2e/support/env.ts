import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * `.env.local`, read into `process.env` for the test process itself.
 *
 * Next loads it for the SERVER. Nothing loads it for Playwright, and the setup needs
 * SESSION_SECRET to mint the admin cookie with the project's own `issueSession` rather
 * than with a second implementation of the signature that could drift from it.
 *
 * Deliberately minimal: `KEY=value`, `#` comments, optional surrounding quotes. It is not
 * a dotenv replacement, and it is not asked to be — it reads one file this repo controls.
 */
/**
 * Playwright is always started from the repository root, and `playwright.config.ts` lives
 * there — so `cwd` is the root. Asserted rather than assumed: everything below writes and
 * restores content files by path, and a wrong root would do it somewhere else.
 */
export const projectRoot = process.cwd();

export function assertProjectRoot(): void {
  if (
    !existsSync(path.join(projectRoot, "next.config.ts")) &&
    !existsSync(path.join(projectRoot, "next.config.mjs")) &&
    !existsSync(path.join(projectRoot, "next.config.js"))
  ) {
    throw new Error(`Playwright is not running from the repository root (cwd is ${projectRoot}).`);
  }
}

export function loadEnvLocal(): void {
  assertProjectRoot();
  let raw: string;
  try {
    raw = readFileSync(path.join(projectRoot, ".env.local"), "utf8");
  } catch {
    throw new Error(
      ".env.local is missing. The suite needs SESSION_SECRET from it to sign an admin session.",
    );
  }

  for (const line of raw.split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match || line.trimStart().startsWith("#")) continue;
    const name = match[1];
    const value = match[2];
    if (name === undefined || value === undefined) continue;
    // Next un-escapes `\$` when it reads the file; the bcrypt hash relies on that. Do the
    // same so a value copied out of here matches what the server sees.
    process.env[name] = value
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/\\\$/g, "$");
  }

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not set in .env.local. The suite cannot sign a session.");
  }
}
