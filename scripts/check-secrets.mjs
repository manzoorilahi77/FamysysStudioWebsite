// Fails when a credential-shaped literal appears in a file git is tracking.
//
// The rule this enforces is simple: secrets live in .env.local, which .gitignore covers,
// and .env.example carries the variable NAMES with empty values so a new machine knows
// what to fill in. Anything with a real value in a tracked file is either a mistake or a
// leak, and both are cheaper to catch here than in a git history rewrite.
//
//   node scripts/check-secrets.mjs          scan every tracked file
//   node scripts/check-secrets.mjs --staged scan what is about to be committed
//
// Wired into `npm run lint`, so it fails the build the same way a lint error does.
//
// It scans the WORKING COPY of tracked files rather than the index, because that is what
// the next commit will contain. Untracked files are skipped on purpose — .env.local is
// untracked and full of real values, and reading it here would be the leak.

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Files whose whole job is to describe the shape of a secret without holding one. */
const ALLOWED_FILES = new Set([".env.example", "scripts/check-secrets.mjs"]);

/** Binary and generated things a scan would only produce noise on. */
const SKIP_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".svg",
  ".mp4",
  ".webm",
  ".mov",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".pdf",
  ".zip",
  ".gz",
  ".lock",
  ".yaml",
]);

const MAX_BYTES = 2_000_000;

/**
 * Each rule is deliberately narrow. A pattern that matches "anything long and random"
 * fires on minified output and hashes, gets muted, and then catches nothing — so these
 * describe specific credential shapes instead.
 */
const RULES = [
  {
    id: "env-assignment",
    // KEY=value where the key names a secret and the value is not empty.
    // `${...}`, `process.env.X` and a bare placeholder are all fine.
    pattern:
      /\b(DB_PASSWORD|DB_USER|SESSION_SECRET|ADMIN_PASSWORD_HASH|[A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|API_KEY|APIKEY|ACCESS_KEY|PRIVATE_KEY))\s*=\s*(?!$|\s|["'`]?\s*$)(?!\$\{)(?!process\.env)(?!<)["'`]?([^\s"'`#$<][^\s"'`#]{5,})/gm,
    message: "a secret-named variable with a value in it",
  },
  {
    id: "bcrypt-hash",
    pattern: /\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/g,
    message: "a bcrypt hash",
  },
  {
    id: "database-url",
    // scheme://user:password@host — the password is the part that matters.
    pattern:
      /\b(?:mysql|mariadb|postgres|postgresql|mongodb(?:\+srv)?|redis|amqp):\/\/[^\s:/@"'`]+:[^\s:/@"'`]+@/g,
    message: "a connection string with an inline password",
  },
  {
    id: "private-key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
    message: "a private key block",
  },
  {
    id: "aws-access-key",
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    message: "an AWS access key id",
  },
  {
    id: "provider-token",
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|sk-[A-Za-z0-9]{32,}|xox[baprs]-[A-Za-z0-9-]{10,})\b/g,
    message: "a provider API token",
  },
];

/** `// allow-secret: <why>` on the line, or the line before, exempts that line. */
function isExempt(lines, index) {
  const own = lines[index] ?? "";
  const previous = index > 0 ? (lines[index - 1] ?? "") : "";
  return /allow-secret:/.test(own) || /allow-secret:/.test(previous);
}

function trackedFiles(stagedOnly) {
  const args = stagedOnly
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR"]
    : ["ls-files"];
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function scan(file) {
  if (ALLOWED_FILES.has(file)) return [];
  if (SKIP_EXTENSIONS.has(path.extname(file).toLowerCase())) return [];

  const absolute = path.join(ROOT, file);
  let text;
  try {
    if (statSync(absolute).size > MAX_BYTES) return [];
    text = readFileSync(absolute, "utf8");
  } catch {
    // Deleted, renamed away, or unreadable. Not this script's problem.
    return [];
  }
  if (text.includes("\u0000")) return [];

  const lines = text.split(/\r?\n/);
  const findings = [];
  for (const rule of RULES) {
    for (const [index, line] of lines.entries()) {
      rule.pattern.lastIndex = 0;
      if (!rule.pattern.test(line)) continue;
      if (isExempt(lines, index)) continue;
      // The finding names the file, the line and the RULE — never the value.
      findings.push({ file, line: index + 1, rule: rule.id, message: rule.message });
    }
  }
  return findings;
}

const stagedOnly = process.argv.includes("--staged");
const findings = trackedFiles(stagedOnly).flatMap(scan);

if (findings.length === 0) {
  process.exit(0);
}

console.error(
  `\ncheck-secrets: ${findings.length} credential-shaped literal${findings.length === 1 ? "" : "s"} in tracked files.\n`,
);
for (const finding of findings) {
  console.error(`  ${finding.file}:${finding.line}  ${finding.message} (${finding.rule})`);
}
console.error(
  [
    "",
    "Values belong in .env.local, which is gitignored. .env.example lists the names with",
    "empty values. If a line is a false positive — a fixture, a regex, documentation —",
    "put `// allow-secret: <why>` on it or the line above.",
    "",
    "If one of these is real and has been pushed, the value is compromised: rotate it",
    "before removing it from history.",
    "",
  ].join("\n"),
);
process.exit(1);
