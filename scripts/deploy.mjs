// Uploads a built site to studio.famysys.com and switches it on.
//
//   npm run build && npm run deploy
//   npm run deploy -- --dry     say what would happen, change nothing
//
// See docs/deployment.md for the shape of the thing this talks to. In short: the host has
// no "Setup Node.js App" screen, so the site is a PM2 process on loopback with Apache
// reverse-proxying to it, and a deploy is an upload into a new timestamped release
// directory followed by a symlink move.
//
// WHY A SYMLINK RATHER THAN OVERWRITING. The upload takes about a minute over this link.
// Written over the live directory, that minute is a minute of a half-replaced site being
// served — a page from the new build asking for a chunk that no longer exists. Into a
// directory nothing is reading, it is a minute of nothing happening, and the switch is one
// atomic rename. It is also what makes a rollback a symlink move instead of a re-upload.
//
// This script never reads or prints a credential. The server's .env was placed once, by
// hand, and is symlinked into each release.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const HOST = process.env.DEPLOY_HOST ?? "aspirfxc@studio.famysys.com";
const REMOTE_ROOT = process.env.DEPLOY_ROOT ?? "/home/aspirfxc/apps/fsstudios";
const PM2 = "/home/aspirfxc/.nvm/versions/node/v22.21.1/bin/pm2";
const PM2_APP = "fsstudios";
const LOCAL_PORT = 6570; // must match deploy/htaccess and shared/.env
const KEEP_RELEASES = 5;

/**
 * What must not be uploaded, whatever the build put in the standalone folder.
 *
 * The first three are the ones that matter: local credentials, the git history, and the
 * agent configuration. The rest is weight — 176 MB of build cache, 33 MB of design
 * explorations, a pile of one-off screenshot scripts — that turns a one-minute upload into
 * a twenty-minute one and puts the studio's unpublished work on a shared host for no
 * reason.
 *
 * `src` and `scripts` stay. The content writer reads the TypeScript sources back at
 * runtime on the CONTENT_SOURCE=static path, and `db/migrations` is worth having beside
 * the app it migrated. The one part of `scripts` that does not ship is `scripts/verify` —
 * browser screenshot scripts that need Playwright and a served export, neither of which
 * exists on the host. The two script patterns below empty it.
 */
const EXCLUDE = [
  // Unanchored, and deliberately without a leading "./". GNU tar matches an exclude
  // pattern against each path component, so ".env.*" catches ".env.local" wherever it
  // sits — while "./.env.*", which looks more precise, matches nothing at all and lets
  // the credentials file straight through. The assertion below is what caught that.
  ".env",
  ".env.*",
  ".git",
  ".claude",
  ".next/cache",
  "docs",
  "out",
  "shots*",
  "vr-*.mjs",
  "verify-about.mjs",
  "vr-out.txt",
  "tsconfig.tsbuildinfo",
];

const dryRun = process.argv.includes("--dry");

function say(message) {
  console.log(message);
}

function fail(message) {
  console.error("\n" + message + "\n");
  process.exit(1);
}

/** Runs a command and stops the deploy if it fails, showing what the command said. */
function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: "pipe", ...options }) ?? "";
  } catch (error) {
    const detail = String(error.stderr || error.stdout || error.message).trim();
    fail(command + " failed:\n" + detail);
  }
}

/** One command over SSH. Quoting is the caller's problem, so keep them simple. */
function remote(script) {
  return run("ssh", ["-o", "BatchMode=yes", HOST, script]);
}

// ---------------------------------------------------------------------------------------
// 1. Is there something to deploy, and is it the build we think it is?
// ---------------------------------------------------------------------------------------

const standalone = path.join(ROOT, ".next", "standalone");
const staticDir = path.join(ROOT, ".next", "static");
const buildIdFile = path.join(ROOT, ".next", "BUILD_ID");

if (!existsSync(standalone)) {
  fail(
    "No .next/standalone. Run `npm run build` first.\n" +
      "If the build ran and this is still missing, check that next.config.ts still sets\n" +
      'output: "standalone".',
  );
}
if (!existsSync(staticDir)) {
  fail("No .next/static. The build is incomplete — run `npm run build` again.");
}

const buildId = readFileSync(buildIdFile, "utf8").trim();
const release = new Date().toISOString().replace(/[-:]/g, "").replace(/\..*/, "");
const releaseDir = REMOTE_ROOT + "/releases/" + release;

say("Build   " + buildId);
say("Release " + release);
say("Host    " + HOST);

// The standalone output copies public/ but deliberately not .next/static: Next assumes a
// CDN serves it. Here the Node process serves it, so it has to be in the release.
const needsStatic = !existsSync(path.join(standalone, ".next", "static"));
const needsPublic = !existsSync(path.join(standalone, "public"));

if (dryRun) {
  say("");
  say(
    "--dry: would pack" + (needsStatic ? " + .next/static" : "") + (needsPublic ? " + public" : ""),
  );
  say("       upload to " + releaseDir + ", switch the symlink, restart " + PM2_APP + ".");
  say("       Nothing sent.");
  process.exit(0);
}

// ---------------------------------------------------------------------------------------
// 2. Pack
// ---------------------------------------------------------------------------------------

// EVERY PATH GIVEN TO tar IS RELATIVE, and the working directory is this repository.
//
// The tar on PATH on Windows is GNU tar, which reads `host:path` in a file argument as a
// remote archive over rsh. An absolute Windows path is exactly that shape, so packing into
// the system temp directory fails with "Cannot connect to C: resolve failed" — a network
// error, while writing a local file, in a script that has not opened a socket yet.
// `--force-local` is the documented switch for it and it does not fix the `-C` arguments.
// Relative paths have no colon in them and the whole class of problem goes away.
const workspace = path.join(ROOT, ".deploy-tmp");
const archive = path.join(workspace, "release.tgz");
const relativeArchive = ".deploy-tmp/release.tgz";

try {
  mkdirSync(workspace, { recursive: true });

  say("");
  say("Packing…");

  // The two things the standalone output leaves out are copied INTO it before packing,
  // rather than added to the archive from a second source root.
  //
  // Next omits .next/static on the assumption that a CDN serves it; here the Node process
  // serves it, so it has to sit beside the server's own .next. Adding it with a second `-C`
  // does not work: tar's `-C` is relative to wherever the previous one left it, so
  // `-C .next/standalone . -C .next static` looks for `.next/standalone/.next/static` and
  // fails with "Cannot stat" on a path nobody wrote. Copying 1.2 MB first is one line and
  // it makes the archive a faithful picture of the release directory.
  if (needsStatic) cpSync(staticDir, path.join(standalone, ".next", "static"), { recursive: true });
  if (needsPublic)
    cpSync(path.join(ROOT, "public"), path.join(standalone, "public"), { recursive: true });

  // ORDER MATTERS AND tar WILL TELL YOU SO: an --exclude after the operand it should apply
  // to is positional, affects nothing, and warns rather than fails. Every exclude goes
  // before the first -C.
  const args = ["-czf", relativeArchive];
  // `--exclude=PATTERN`, joined — NOT `"--exclude", pattern` as two arguments. This tar
  // accepts the two-argument form without complaint and then excludes nothing, which is
  // how .env.local reached the archive twice before the assertion below stopped it.
  for (const pattern of EXCLUDE) args.push("--exclude=" + pattern);
  args.push("-C", ".next/standalone", ".");
  run("tar", args, { cwd: ROOT });

  // -------------------------------------------------------------------------------------
  // 2b. Prove the archive is safe to send
  // -------------------------------------------------------------------------------------
  //
  // THE STANDALONE FOLDER IS NOT A CLEAN ROOM. The tracer widens to whole directories when
  // it meets a path it cannot resolve — the content writer reads its own TypeScript sources
  // back at runtime — so the folder ends up holding the working tree, .env.local and .git
  // included. The exclude list above removes them. This asserts that it did, because an
  // exclude pattern that silently stops matching is exactly the kind of failure that ships
  // a credentials file to a shared host and looks like a normal deploy while doing it.
  const listing = run("tar", ["-tzf", relativeArchive], { cwd: ROOT }).split("\n");
  const forbidden = listing.filter((entry) =>
    /(^|\/)\.env(\.|$)|(^|\/)\.git\/|(^|\/)\.claude\//.test(entry),
  );
  if (forbidden.length > 0) {
    fail(
      "The archive contains files that must never leave this machine:\n" +
        forbidden
          .slice(0, 10)
          .map((entry) => "  " + entry)
          .join("\n") +
        (forbidden.length > 10 ? `\n  …and ${forbidden.length - 10} more` : "") +
        "\n\nNothing was uploaded. Fix EXCLUDE in this script before deploying.",
    );
  }

  const megabytes = (statSync(archive).size / 1024 / 1024).toFixed(1);
  say("Packed  " + megabytes + " MB, " + listing.length + " entries, no credentials");

  // -------------------------------------------------------------------------------------
  // 3. Upload into a directory nothing is reading
  // -------------------------------------------------------------------------------------

  say("Uploading…");
  remote("mkdir -p " + releaseDir);
  run("scp", [
    "-o",
    "BatchMode=yes",
    "-q",
    relativeArchive,
    HOST + ":" + releaseDir + "/release.tgz",
  ]);

  say("Unpacking…");
  remote(
    "cd " +
      releaseDir +
      " && tar -xzf release.tgz && rm -f release.tgz && " +
      // The environment lives outside the release, so a rollback does not roll back the
      // credentials and a release directory can be deleted without thought.
      "ln -sfn " +
      REMOTE_ROOT +
      "/shared/.env " +
      releaseDir +
      "/.env && " +
      "test -f " +
      releaseDir +
      "/server.js",
  );

  // -------------------------------------------------------------------------------------
  // 4. Switch, and restart
  // -------------------------------------------------------------------------------------

  say("Switching…");
  const previous = remote("readlink " + REMOTE_ROOT + "/current 2>/dev/null || echo none").trim();
  remote("ln -sfn " + releaseDir + " " + REMOTE_ROOT + "/current");

  const running = remote(
    PM2 + " describe " + PM2_APP + " >/dev/null 2>&1 && echo yes || echo no",
  ).trim();
  if (running === "yes") {
    remote(PM2 + " restart " + PM2_APP + " --update-env");
  } else {
    remote(PM2 + " start " + REMOTE_ROOT + "/ecosystem.config.js --env production");
  }
  remote(PM2 + " save >/dev/null 2>&1 || true");

  // -------------------------------------------------------------------------------------
  // 5. Did it come back?
  // -------------------------------------------------------------------------------------

  say("Checking…");
  const probe =
    "for i in 1 2 3 4 5 6 7 8 9 10; do " +
    'code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://127.0.0.1:' +
    LOCAL_PORT +
    "/ || true); " +
    'if [ "$code" = "200" ]; then break; fi; sleep 2; done; echo $code';
  const status = remote(probe).trim();

  if (status !== "200") {
    console.error(
      "\nThe new release answers " + (status || "nothing") + " on 127.0.0.1:" + LOCAL_PORT + ".",
    );
    if (previous !== "none") {
      console.error("Rolling back to " + previous + ".");
      remote("ln -sfn " + previous + " " + REMOTE_ROOT + "/current");
      remote(PM2 + " restart " + PM2_APP + " --update-env");
      console.error("Rolled back. The site is serving the previous release.");
    }
    fail(
      "Deploy aborted. Logs: ssh " +
        HOST +
        " " +
        PM2 +
        " logs " +
        PM2_APP +
        " --lines 50 --nostream",
    );
  }

  // -------------------------------------------------------------------------------------
  // 6. Keep the last few releases, so a rollback has somewhere to go
  // -------------------------------------------------------------------------------------

  remote(
    "cd " +
      REMOTE_ROOT +
      "/releases && ls -1t | tail -n +" +
      (KEEP_RELEASES + 1) +
      " | xargs -r rm -rf",
  );
  const kept = remote("ls -1t " + REMOTE_ROOT + "/releases")
    .trim()
    .split("\n")
    .filter(Boolean);

  say("");
  say(
    "Live. " +
      release +
      " is serving; " +
      kept.length +
      " release" +
      (kept.length === 1 ? "" : "s") +
      " on disk.",
  );
  say(
    "Rollback target: " +
      (previous === "none" ? "none yet — this is the first release" : path.basename(previous)),
  );
} finally {
  rmSync(workspace, { recursive: true, force: true });
}
