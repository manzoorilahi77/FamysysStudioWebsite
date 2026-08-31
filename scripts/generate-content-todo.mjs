// Regenerates the drafted-copy inventories in docs/content-todo.md from the content
// modules themselves — one generated block per inner page.
//
//   pnpm docs:content-todo
//
// The point is that the list is DERIVED, not transcribed. A hand-kept table drifts the
// first time someone edits a string, and a reviewer reading a stale table approves copy
// that is not on the page. This script reads each page's content export, walks every
// string in it, and marks a string as drafted when it does not appear verbatim anywhere
// in the client's own content modules (marketing, portfolio, services). So inlining an
// approved string into the page content removes it from the review list automatically,
// and inventing a new one adds it.
//
// TypeScript is compiled to a temp directory with the repo's own `tsc` rather than a
// runtime loader, so the script needs no dependency the project does not already have.

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docPath = path.join(projectRoot, "docs", "content-todo.md");

const END_MARKER = "<!-- /generated -->";

function beginMarker(slug) {
  return `<!-- generated: ${slug} drafted copy — do not edit by hand, run \`pnpm docs:content-todo\` -->`;
}

/** One generated block per page: which module to read, and which export holds the page. */
const PAGES = [
  {
    slug: "how-we-work",
    entry: "src/infrastructure/content/static/how-we-work.content.ts",
    module: "infrastructure/content/static/how-we-work.content.js",
    exportName: "howWeWorkPage",
  },
  {
    slug: "ways-to-work",
    entry: "src/infrastructure/content/static/ways-to-work.content.ts",
    module: "infrastructure/content/static/ways-to-work.content.js",
    exportName: "waysToWorkPage",
  },
  {
    slug: "selected-work",
    entry: "src/infrastructure/content/static/selected-work.content.ts",
    module: "infrastructure/content/static/selected-work.content.js",
    exportName: "selectedWorkPage",
  },
  {
    slug: "about",
    entry: "src/infrastructure/content/static/about.content.ts",
    module: "infrastructure/content/static/about.content.js",
    exportName: "aboutPage",
  },
  {
    slug: "contact",
    entry: "src/infrastructure/content/static/contact.content.ts",
    module: "infrastructure/content/static/contact.content.js",
    exportName: "contactPage",
  },
];

/**
 * Keys carrying a route, file path, enum or derived identifier rather than reviewable
 * copy.
 *
 * `idealForItems` / `typicalWorkItems` are here because they are the SAME approved
 * sentence split for list rendering, round-tripped by a test — listing their fragments
 * would ask the client to re-approve thirty pieces of their own words, and would bury the
 * strings that genuinely need reading. The whole sentence is walked as `idealFor` and
 * `typicalWork` and correctly reads as approved.
 */
const NON_COPY_KEYS = new Set([
  "href",
  "src",
  "poster",
  "kind",
  "aspectRatio",
  "slug",
  "tierSlug",
  "idealForItems",
  "typicalWorkItems",
  // /selected-work: a progression stage references its pieces by slug and the titles are
  // resolved at render, so these are identifiers, not copy.
  "pieceSlugs",
]);

/** Array elements are named by one of these fields, so a path reads as a place. */
const ELEMENT_NAME_KEYS = ["stepTitle", "title", "question", "name"];

function compileContentModules() {
  const outDir = mkdtempSync(path.join(tmpdir(), "famysys-content-"));
  execFileSync(
    process.execPath,
    [
      path.join(projectRoot, "node_modules", "typescript", "lib", "tsc.js"),
      ...PAGES.map((page) => path.join(projectRoot, page.entry)),
      path.join(projectRoot, "src/infrastructure/content/static/services.content.ts"),
      "--outDir",
      outDir,
      "--rootDir",
      path.join(projectRoot, "src"),
      "--module",
      "commonjs",
      "--moduleResolution",
      "node",
      "--target",
      "es2022",
      "--skipLibCheck",
    ],
    { cwd: projectRoot, stdio: "inherit" },
  );
  return outDir;
}

/** Value objects expose their primitive as `.value`; everything else walks as an object. */
function unwrap(node) {
  if (node && typeof node === "object" && typeof node.value === "string") {
    return node.value;
  }
  return node;
}

function nameOfElement(element, index) {
  for (const key of ELEMENT_NAME_KEYS) {
    if (element && typeof element === "object" && typeof element[key] === "string") {
      return element[key];
    }
  }
  return String(index);
}

/** Every string in `node`, as [dotted path, string] pairs. */
function collectStrings(node, trail = [], out = []) {
  const value = unwrap(node);

  if (typeof value === "string") {
    out.push([trail.join(" › "), value]);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((element, index) => {
      collectStrings(element, [...trail, nameOfElement(unwrap(element), index)], out);
    });
    return out;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (NON_COPY_KEYS.has(key)) {
        continue;
      }
      collectStrings(child, [...trail, key], out);
    }
  }
  return out;
}

function escapeCell(text) {
  return text.replace(/\|/g, "\\|");
}

function main() {
  const outDir = compileContentModules();
  try {
    const require = createRequire(import.meta.url);
    const load = (relative) => require(path.join(outDir, relative));

    const marketing = load("infrastructure/content/static/marketing.content.js");
    const portfolio = load("infrastructure/content/static/portfolio.content.js");
    const services = load("infrastructure/content/static/services.content.js");

    const approved = new Set(
      [marketing, portfolio, services].flatMap((module) =>
        collectStrings(module).map(([, text]) => text),
      ),
    );

    let doc = readFileSync(docPath, "utf8");

    for (const page of PAGES) {
      const content = load(page.module)[page.exportName];
      if (!content) {
        throw new Error(`${page.module} does not export ${page.exportName}.`);
      }

      const entries = collectStrings(content);
      const drafted = entries.filter(([, text]) => !approved.has(text));
      const reused = entries.length - drafted.length;

      const rows = drafted
        .map(([where, text]) => `| ${escapeCell(where)} | ${escapeCell(text)} |`)
        .join("\n");

      const begin = beginMarker(page.slug);
      const block = [
        begin,
        "",
        `**${drafted.length} drafted strings**, against ${reused} read from the client's own`,
        "content modules and therefore not up for review here. Regenerate with",
        `\`pnpm docs:content-todo\` after any edit to \`${path.basename(page.entry)}\`.`,
        "",
        "| Where | Drafted string |",
        "|---|---|",
        rows,
        "",
        END_MARKER,
      ].join("\n");

      const beginAt = doc.indexOf(begin);
      if (beginAt === -1) {
        throw new Error(
          `Could not find the "${page.slug}" generated block marker in ${docPath}. Add the section heading and both markers, then re-run.`,
        );
      }
      const endAt = doc.indexOf(END_MARKER, beginAt);
      if (endAt === -1) {
        throw new Error(`The "${page.slug}" generated block in ${docPath} has no closing marker.`);
      }

      doc = doc.slice(0, beginAt) + block + doc.slice(endAt + END_MARKER.length);
      console.log(`${page.slug}: ${drafted.length} drafted strings.`);
    }

    writeFileSync(docPath, doc, "utf8");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

main();
