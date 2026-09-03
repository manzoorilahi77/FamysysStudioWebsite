// `next dev` and `next build` share .next, and each one poisons the other's copy of it.
//
//   build left behind, then dev runs  ->  dev serves 404 for every /_next/static asset,
//                                        or throws `Cannot find module './951.js'`
//   dev left behind, then build runs  ->  `PageNotFoundError: Cannot find module for
//                                        page: /_document`
//
// Both failure modes have hit this repo. Neither is recoverable by retrying; the only fix
// is to delete .next, which is what this does — but only when the directory actually holds
// the WRONG kind of build, so a dev -> dev or build -> build cycle keeps its webpack cache
// and stays fast. Wired to `predev` and `prebuild` in package.json, so it is not something
// anyone has to remember.
//
// This guard fixes the NEXT start. It cannot rescue a dev server that is already running
// when a build overwrites .next underneath it — that process has the old chunk manifest in
// memory and will serve 404s until restarted. Stop dev before building.
//
// `distDir` is not an alternative. Setting it (or NEXT_DIST_DIR) does not keep `next build`
// out of .next under `output: "export"` — verified by deleting .next, building with the
// variable set, and finding a complete production build in .next regardless.

import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";

const NEXT_DIR = path.resolve(".next");

/** A production build writes BUILD_ID; `next dev` never does. */
const PRODUCTION_MARKERS = ["BUILD_ID", "export-marker.json"];
/** Dev writes its chunks under static/development; a production build never does. */
const DEV_MARKERS = [path.join("static", "development")];

const mode = process.argv[2];
if (mode !== "dev" && mode !== "build") {
  console.error("usage: clean-stale-next.mjs <dev|build>");
  process.exit(1);
}

// Before dev, the stale thing is a production build. Before a build, it is a dev server's.
const stale = mode === "dev" ? PRODUCTION_MARKERS : DEV_MARKERS;
const found = stale.find((marker) => existsSync(path.join(NEXT_DIR, marker)));

if (found) {
  rmSync(NEXT_DIR, { recursive: true, force: true });
  const left = mode === "dev" ? "production build" : "dev server";
  console.log(`[clean-stale-next] removed .next — it held a ${left} (.next/${found})`);
}

// Deleting .next is not enough when a dev server is still running: it re-creates its own
// chunks and manifests in .next while `next build` compiles, and the build then fails in
// "Collecting page data" with PageNotFoundError for every route. Nothing in the build
// output points at the dev server, so the guard below names it instead.
if (mode === "build" && !process.env.ALLOW_DEV_DURING_BUILD) {
  const running = findNextDevProcesses();
  if (running.length > 0) {
    console.error(
      [
        "[clean-stale-next] a `next dev` server is running. It will overwrite .next while",
        "the build runs and the build will fail with PageNotFoundError for every route.",
        "",
        ...running.map((line) => `  ${line}`),
        "",
        "Stop the dev server and build again (or set ALLOW_DEV_DURING_BUILD=1 to override).",
      ].join("\n"),
    );
    process.exit(1);
  }
}

/** Command lines of any running `next dev` process, best-effort — never throws. */
function findNextDevProcesses() {
  const command =
    process.platform === "win32"
      ? "powershell -NoProfile -Command \"Get-CimInstance Win32_Process -Filter \\\"Name='node.exe'\\\" | ForEach-Object { $_.CommandLine }\""
      : "ps -A -o args=";

  let output;
  try {
    output = execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return []; // No process list available — do not block the build over it.
  }

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /\bnext\b/.test(line) && /\bdev\b/.test(line))
    .filter((line) => !line.includes("clean-stale-next"));
}
