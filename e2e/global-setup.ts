import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { clearDrafts, takeContentSnapshot } from "./support/content";
import { loadEnvLocal, projectRoot } from "./support/env";

/**
 * WHAT HAS TO BE TRUE BEFORE THE FIRST TEST RUNS.
 *
 * 1. `.env.local` is loaded into this process, because the session cookie is minted here.
 * 2. The content modules are snapshotted, because publishing rewrites them.
 * 3. Any draft left behind by a previous run is deleted, so "this section has unpublished
 *    edits" means this run put them there.
 * 4. A signed admin session is written as Playwright storage state.
 *
 * ON THE COOKIE. The sign-in FORM cannot be used here: its rate limiter counts rows in
 * `login_attempts`, and the database is unreachable from this machine, so every sign-in
 * answers 503. The cookie is therefore minted with the project's own `issueSession` and
 * the project's own SESSION_SECRET, and the panel's own `isValidSession` is still what
 * decides whether it gets in. Nothing about the gate is bypassed or weakened — the suite
 * simply presents a session it was entitled to be issued. The login form itself is
 * therefore NOT covered here; see docs/deployment.md.
 */

export const STORAGE_STATE = path.join(".playwright", "admin-session.json");

export default async function globalSetup(): Promise<void> {
  loadEnvLocal();

  takeContentSnapshot();
  clearDrafts();

  // Imported after the environment is loaded: the module reads SESSION_SECRET when called,
  // but importing it first would still be relying on ordering that is easy to break.
  const { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, issueSession } =
    await import("../src/infrastructure/auth/session");

  const state = {
    cookies: [
      {
        name: SESSION_COOKIE,
        value: issueSession(),
        domain: "localhost",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  };

  mkdirSync(path.join(projectRoot, ".playwright"), { recursive: true });
  writeFileSync(path.join(projectRoot, STORAGE_STATE), JSON.stringify(state, null, 2), "utf8");
}
