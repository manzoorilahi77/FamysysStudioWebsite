// Clears the ground before the end-to-end suite runs.
//
//   node scripts/e2e-preflight.mjs [port]
//
// TWO THINGS GO WRONG IF THIS IS SKIPPED, and both of them look like application bugs.
//
// A dev server left running from an earlier session holds the port, so Playwright's own
// server never starts and every test talks to whatever that older process is serving —
// which may be an older bundle, or a build whose .next was deleted underneath it. This
// project has produced pages of plausible-looking false failures that way.
//
// And a stale .next survives a source change it does not know about: the pages render,
// the markup is right, and nothing hydrates.
//
// So: anything holding the port is stopped, any Next dev server anywhere is stopped, the
// port is confirmed free, and the stale-build check the dev script already has is run. If
// the port cannot be freed this exits non-zero rather than letting the suite run and
// report nonsense.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.argv[2] ?? process.env.E2E_PORT ?? 4399);

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", shell: false });
  return result.status === 0 ? (result.stdout ?? "") : "";
}

/** Process ids listening on the port, on either platform. */
function holdersOfPort() {
  if (process.platform === "win32") {
    const output = run("netstat", ["-ano", "-p", "TCP"]);
    return [
      ...new Set(
        output
          .split(/\r?\n/)
          .filter((line) => line.includes("LISTENING") && line.includes(`:${port} `))
          .map((line) => line.trim().split(/\s+/).at(-1))
          .filter((pid) => pid && pid !== "0"),
      ),
    ];
  }
  const output = run("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"]);
  return [...new Set(output.split(/\s+/).filter(Boolean))];
}

/**
 * Every Next development server, and every Playwright runner that is not this one.
 *
 * The runner matters as much as the server. Playwright owns the dev server it starts and
 * restarts it if it dies, so killing only the server leaves an abandoned runner putting a
 * new one straight back on the port — the port is freed and retaken faster than any check
 * can see, and the run that follows fails with EADDRINUSE from inside Playwright's own
 * web-server manager, which says nothing about the cause. Stop the parent, not the child.
 */
const STRAY = String.raw`next(-server)?\s+(dev|start)|next-server|@playwright[\\/]test[\\/]cli|playwright(\.js)?\s+test`;

function strayProcesses() {
  if (process.platform !== "win32") {
    const output = run("pgrep", ["-f", STRAY]);
    return output.split(/\s+/).filter(Boolean);
  }
  const output = run("powershell", [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | " +
      `Where-Object { $_.CommandLine -match '${STRAY.replace(/'/g, "''")}' } | ` +
      "Select-Object -ExpandProperty ProcessId",
  ]);
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function kill(pid) {
  if (String(pid) === String(process.pid)) return;
  if (process.platform === "win32") {
    run("taskkill", ["/PID", String(pid), "/T", "/F"]);
  } else {
    try {
      process.kill(Number(pid), "SIGKILL");
    } catch {
      // Already gone, which is the outcome this wanted.
    }
  }
}

const stopped = new Set([...holdersOfPort(), ...strayProcesses()]);
for (const pid of stopped) kill(pid);
if (stopped.size > 0) {
  console.log(`[e2e] stopped ${stopped.size} process(es): ${[...stopped].join(", ")}`);
}

/** Blocking sleep: this script is a sequence of side effects, not a server. */
function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

/**
 * Confirm rather than assume, and confirm it MORE THAN ONCE.
 *
 * A single check is not enough, and the reason is worth stating: a dev server being shut
 * down has already released its socket while its supervising shell is still alive, and a
 * dev server being started has not bound yet. Both look identical to one glance at
 * netstat — free — and the second one then takes the port out from under the suite, which
 * fails with EADDRINUSE from inside Playwright's web server and reports nothing useful.
 *
 * So the port has to be free, and still free a beat later, before the run begins.
 */
const SETTLE_MS = 2_000;
const ATTEMPTS = 15;

let free = false;
for (let attempt = 0; attempt < ATTEMPTS && !free; attempt += 1) {
  // Both, every time: a server that came back means the thing that starts servers is still
  // alive, and killing the server again would only buy another second.
  const holders = [...new Set([...holdersOfPort(), ...strayProcesses()])];
  if (holders.length > 0) {
    for (const pid of holders) kill(pid);
    sleep(500);
    continue;
  }
  sleep(SETTLE_MS);
  free = holdersOfPort().length === 0;
}

if (!free) {
  console.error(
    `[e2e] port ${port} keeps being taken. Something is starting a server on it faster than ` +
      "this can stop it — find it and stop it, because the suite would otherwise be testing " +
      "whatever that process is serving.",
  );
  process.exit(1);
}
console.log(`[e2e] port ${port} is free and stayed free.`);

// The build directory the dev server is about to use. `predev` runs the project's own
// staleness check, but a directory left by a `next build` is a different shape again, so
// it goes regardless: a full rebuild costs a minute and a false failure costs an hour.
const buildDirectory = path.join(projectRoot, ".next");
if (existsSync(buildDirectory)) {
  rmSync(buildDirectory, { recursive: true, force: true });
  console.log("[e2e] removed .next so the run starts from a clean build.");
}

// Playwright needs its browser. Cheap when it is already there, and a clear failure when
// it is not — rather than a first test that times out on a missing executable.
try {
  execFileSync("npx", ["playwright", "install", "chromium"], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
} catch {
  console.error("[e2e] `playwright install chromium` failed. The browser must be installed.");
  process.exit(1);
}
