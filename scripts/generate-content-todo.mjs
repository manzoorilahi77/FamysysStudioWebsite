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
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

/**
 * THE MARKERS THAT NO GENERATED TABLE COVERS.
 *
 * The five blocks above list every drafted STRING on an inner page, by comparing it
 * against the client's own content modules. That test cannot say anything about the
 * modules it compares AGAINST: every string in `marketing.content.ts` and
 * `portfolio.content.ts` is in the approved set by definition, including the ones a
 * `TODO(client)` comment right above them says are drafted, stock or unconfirmed. The two
 * presentation components that carry markers are outside the content modules entirely.
 *
 * So those markers were rendering on the live site with no list of them anywhere. This
 * block is that list, read from the source rather than transcribed.
 *
 * The scan below covers ALL of `src/` and throws when it meets a marker in a file that is
 * neither listed here nor covered by a generated page table nor named in
 * DOCUMENTED_ELSEWHERE. A new `TODO(client)` in a new file therefore fails this script
 * instead of quietly joining the set of markers nobody has a list of.
 */
const MARKER_FILES = [
  "src/infrastructure/content/static/marketing.content.ts",
  "src/infrastructure/content/static/portfolio.content.ts",
  "src/presentation/components/DemoForm.tsx",
  "src/presentation/sections/shared/Faq.tsx",
];

/** Files whose markers are explained in prose elsewhere in this document. */
const DOCUMENTED_ELSEWHERE = new Set([
  // Its six options are the "Your role" row of "Copy the brief does not supply".
  "src/domain/lead/value-objects/ContactRole.ts",
  // These two describe the marker CONVENTION; they do not hold copy.
  "src/infrastructure/cms/contentAst.ts",
  "src/infrastructure/cms/ContentFileWriter.ts",
  // Every string on this page is listed by the creative-services prose section.
  "src/infrastructure/content/static/creative-services.content.ts",
]);

/** Any mention of the convention, used to catch a marker in an unlisted file. */
const MARKER = /TODO\(client\)/;
/** A marker itself always has the colon; prose ABOUT one, inside a marker, does not. */
const MARKER_START = /TODO\(client\):/;
const LINE_COMMENT = /^\s*\/\//;
const BLOCK_OPEN = /^\s*\{?\/\*/;
const DOC_CONTINUATION = /^\s*\*/;

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    if (!/\.tsx?$/.test(entry.name) || entry.name.includes(".test.")) return [];
    return [full];
  });
}

/**
 * Where a marker's comment ends. The three comment shapes in this codebase end
 * differently, and getting it wrong is what makes prose inside one marker look like a
 * second marker — which is why `MARKER_START` requires the colon.
 */
function endOfMarker(lines, from) {
  const first = lines[from];

  if (BLOCK_OPEN.test(first)) {
    if (first.includes("*/")) return from;
    for (let at = from + 1; at < lines.length; at += 1) {
      if (lines[at].includes("*/")) return at;
    }
    return from;
  }

  if (LINE_COMMENT.test(first) || DOC_CONTINUATION.test(first)) {
    const same = LINE_COMMENT.test(first) ? LINE_COMMENT : DOC_CONTINUATION;
    let at = from;
    while (
      at + 1 < lines.length &&
      same.test(lines[at + 1]) &&
      !MARKER_START.test(lines[at + 1]) &&
      !lines[at + 1].includes("*/")
    ) {
      at += 1;
    }
    return at;
  }

  // A trailing comment on a line of code: the marker is that line and no more.
  return from;
}

/** The marker's own words, collapsed to one line, without the comment syntax. */
function markerText(lines, from, to) {
  const raw = lines
    .slice(from, to + 1)
    .join(" ")
    .slice(
      lines
        .slice(from, to + 1)
        .join(" ")
        .search(MARKER_START),
    );
  return raw
    .replace(/\*\/\}?/g, "")
    .replace(/\/\//g, "")
    .replace(/^\s*TODO\(client\):\s*/, "")
    .replace(/\s+\*\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The code the marker sits above, or beside when it trails one.
 *
 * Block comments are tracked open-to-close rather than matched line by line: their middle
 * lines carry no comment prefix, and reading one as code is how a marker ends up captioned
 * with half a sentence from the comment underneath it.
 */
function guardedLine(lines, from, to) {
  const own = lines[from];
  const isComment = BLOCK_OPEN.test(own) || LINE_COMMENT.test(own) || DOC_CONTINUATION.test(own);
  if (!isComment) {
    return own.slice(0, own.search(/\{?\/\*|\/\//)).trim();
  }

  let inBlock = false;
  for (let at = to + 1; at < lines.length && at <= to + 30; at += 1) {
    const line = lines[at];
    if (inBlock) {
      if (line.includes("*/")) inBlock = false;
      continue;
    }
    if (line.trim() === "" || LINE_COMMENT.test(line)) continue;
    if (BLOCK_OPEN.test(line)) {
      if (!line.includes("*/")) inBlock = true;
      continue;
    }
    return line.trim();
  }
  return "";
}

function findMarkers(relative) {
  const lines = readFileSync(path.join(projectRoot, relative), "utf8").split(/\r?\n/);
  const found = [];
  let skipUntil = -1;

  lines.forEach((line, index) => {
    if (index <= skipUntil || !MARKER_START.test(line)) return;
    const to = endOfMarker(lines, index);
    skipUntil = to;
    found.push({
      line: index + 1,
      text: markerText(lines, index, to),
      guards: guardedLine(lines, index, to),
    });
  });
  return found;
}

function assertNoUnlistedMarkers() {
  const covered = new Set([
    ...MARKER_FILES,
    ...DOCUMENTED_ELSEWHERE,
    ...PAGES.map((page) => page.entry),
  ]);
  const stray = sourceFiles(path.join(projectRoot, "src"))
    .map((full) => path.relative(projectRoot, full).split(path.sep).join("/"))
    .filter((relative) => !covered.has(relative))
    .filter((relative) => MARKER.test(readFileSync(path.join(projectRoot, relative), "utf8")));

  if (stray.length > 0) {
    throw new Error(
      `TODO(client) markers in files no part of docs/content-todo.md covers:\n  ${stray.join("\n  ")}\n` +
        "Add each file to MARKER_FILES (to be listed) or to DOCUMENTED_ELSEWHERE (with a reason).",
    );
  }
}

function markerBlock() {
  assertNoUnlistedMarkers();

  const rows = MARKER_FILES.flatMap((relative) =>
    findMarkers(relative).map(
      (marker) =>
        `| \`${path.basename(relative)}:${marker.line}\` | ${escapeCell(marker.guards) || "—"} | ${escapeCell(marker.text)} |`,
    ),
  );

  const begin = beginMarker("todo-markers");
  return {
    begin,
    block: [
      begin,
      "",
      `**${rows.length} \`TODO(client)\` markers** that no generated table above can reach:`,
      "every string in `marketing.content.ts` and `portfolio.content.ts` counts as approved",
      "by definition, because those are the modules the approved set is read FROM, and the two",
      "presentation components are outside the content modules altogether. Regenerate with",
      "`pnpm docs:content-todo`.",
      "",
      "| Marker | What it sits on | What it says |",
      "|---|---|---|",
      ...rows,
      "",
      END_MARKER,
    ].join("\n"),
    count: rows.length,
  };
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

    const markers = markerBlock();
    const markersAt = doc.indexOf(markers.begin);
    if (markersAt === -1) {
      throw new Error(
        `Could not find the "todo-markers" generated block marker in ${docPath}. Add the section heading and both markers, then re-run.`,
      );
    }
    const markersEnd = doc.indexOf(END_MARKER, markersAt);
    if (markersEnd === -1) {
      throw new Error(`The "todo-markers" generated block in ${docPath} has no closing marker.`);
    }
    doc = doc.slice(0, markersAt) + markers.block + doc.slice(markersEnd + END_MARKER.length);
    console.log(`todo-markers: ${markers.count} markers.`);

    writeFileSync(docPath, doc, "utf8");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}

main();
