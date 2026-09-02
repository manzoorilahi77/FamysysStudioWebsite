// Formats only the files this working tree has actually changed.
//
//   pnpm format
//
// WHY THIS EXISTS. `prettier --write .` rewrote roughly a hundred files that nobody had
// touched — the README, the spec, the eslint config, components from other passes — and
// most of the diff was line endings, because the tree is CRLF and Prettier's default
// `endOfLine` is `lf`. A format command that produces a hundred-file diff is a command
// nobody can safely run before a commit, which is the one moment it is for.
//
// So this asks git what changed (staged, unstaged and untracked, against HEAD), keeps the
// paths Prettier actually has a parser for, and formats those. Files outside the change
// set are never opened, so their line endings and their formatting are left exactly as
// they are. `pnpm format:all` is still there for a deliberate whole-repo pass.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Extensions this repo's Prettier install has a parser for. */
const FORMATTABLE = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".md",
  ".yml",
  ".yaml",
  ".html",
]);

function git(args) {
  return execFileSync("git", args, { cwd: projectRoot, encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// `diff --name-only HEAD` covers staged and unstaged edits in one pass; untracked files
// have no diff against HEAD at all and have to be asked for separately.
const changed = new Set([
  ...git(["diff", "--name-only", "HEAD"]),
  ...git(["ls-files", "--others", "--exclude-standard"]),
]);

const targets = [...changed]
  .filter((file) => FORMATTABLE.has(path.extname(file)))
  // A deleted or renamed-away path is still listed by `diff --name-only`.
  .filter((file) => existsSync(path.join(projectRoot, file)))
  .sort();

if (targets.length === 0) {
  process.stdout.write("format: no changed files to format.\n");
  process.exit(0);
}

process.stdout.write(`format: ${targets.length} changed file(s).\n`);
// Prettier's own entry point under this node, rather than `pnpm exec` through a shell.
// A shell would need `shell: true` on Windows to find the shim, and passing arguments to
// a shelled child concatenates them unescaped — a path with a space in it would split.
const prettierBin = createRequire(import.meta.url).resolve("prettier/bin/prettier.cjs");
execFileSync(process.execPath, [prettierBin, "--write", ...targets], {
  cwd: projectRoot,
  stdio: "inherit",
});
