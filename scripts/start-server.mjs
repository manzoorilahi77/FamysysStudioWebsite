#!/usr/bin/env node
// LOADS shared/.env DIRECTLY, BEFORE Next's SERVER EVER BOOTS — so a credential reaches
// the app regardless of how the process manager invokes node.
//
// PM2's `node_args`/`interpreter_args` (the flag that is supposed to pass `--env-file` to
// the interpreter) does not reliably reach this app's own `process.env` by the time
// application code runs on PM2 v7, on either server — confirmed by isolated testing (a
// trivial script given the identical config receives every variable; server.js, given the
// identical config, receives none). Rather than depend on PM2's internal spawn
// construction — which this app does not control and which could change between PM2
// versions — this script removes PM2 from the env-loading path entirely: pm2's `script`
// field points HERE instead of at server.js directly, and this is the very first code
// that runs, using `process.loadEnvFile`, the SAME underlying parser Node's own
// `--env-file` flag uses (Node 20.6+), so behaviour is identical to what the deploy docs
// already describe — only the delivery mechanism changes.
//
// `process.cwd()` rather than `import.meta.url` for the base path: PM2 sets `cwd`
// explicitly to the release directory. `cwd` in ecosystem.config.js is given as the
// `current` symlink, but POSIX `getcwd()` — what `process.cwd()` actually returns after a
// `chdir` — resolves through a symlink to its real target, so this process's cwd is
// `releases/<timestamp>`, TWO levels below `apps/fsstudios/`, not one. Confirmed by
// isolated testing: the first version of this file used one `..` and failed with
// `releases/shared/.env` — the symlink swallowed the level a literal path reading would
// expect. Do not "simplify" this back to one `..` without re-testing in isolation.
import path from "node:path";

const envPath = path.resolve(process.cwd(), "..", "..", "shared", ".env");

try {
  process.loadEnvFile(envPath);
} catch (error) {
  // A missing file here is a deploy/ops mistake, not a recoverable condition — fail loudly
  // and immediately, before Next boots and masks it behind an unrelated-looking error.
  console.error(`[start-server] Could not load ${envPath}: ${error.message}`);
  process.exit(1);
}

await import("./server.js");
