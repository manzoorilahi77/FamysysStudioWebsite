// Populates the database from the TypeScript content modules.
//
//   npm run db:seed                  insert what is missing, leave existing values alone
//   npm run db:seed -- --force       reset every value to what the content files say
//   npm run db:seed -- --dry         report what it would write, write nothing
//
// IDEMPOTENCE, AND WHAT "IDEMPOTENT" HAS TO MEAN HERE.
//
// Running twice must not duplicate anything — every write is keyed on a natural key and
// upserts. But the interesting case is running it AFTER someone has edited content in the
// panel. A re-seed then must not quietly revert their work, so the default upsert
// refreshes a string's METADATA (its label, its kind, where it came from, whether it is
// the client's own copy) and leaves `value` and `version` untouched. `--force` is the
// explicit "the files are right, the database is wrong" switch.
//
// WHERE THE DATA COMES FROM.
//
// Two readings of the same content, deliberately:
//   - `cms` gives the CMS read model — every string, its label, its field key, whether it
//     is editable and whose words it is. That is the entire content of `content_strings`,
//     and taking it from there rather than re-deriving it means the database and the panel
//     cannot disagree about what a field is called.
//   - `files.<domain>` gives the entities, for the STRUCTURE a string cannot carry: slugs,
//     media paths, aspect ratios, which capabilities a piece of work exercises.
//
// Both are the FILE-BACKED implementations, constructed below rather than taken from the
// composition root. See the note beside them — going through the container would seed the
// database from itself.
//
// The seed is the migration path. Once these rows exist and the site renders from them,
// the content modules become the fallback rather than the source.

import { readFileSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import type { Connection } from "mysql2/promise";

import type { CmsRecord, CmsValue } from "../src/domain/cms/entities/CmsRecord";
import { StaticCmsRepository } from "../src/infrastructure/cms/StaticCmsRepository";
import { readMediaDirectory } from "../src/infrastructure/cms/contentSources";
import { StaticAboutRepository } from "../src/infrastructure/content/repositories/StaticAboutRepository";
import { StaticContactRepository } from "../src/infrastructure/content/repositories/StaticContactRepository";
import { StaticEngagementRepository } from "../src/infrastructure/content/repositories/StaticEngagementRepository";
import { StaticMarketingContentRepository } from "../src/infrastructure/content/repositories/StaticMarketingContentRepository";
import { StaticPortfolioRepository } from "../src/infrastructure/content/repositories/StaticPortfolioRepository";
import { StaticProcessRepository } from "../src/infrastructure/content/repositories/StaticProcessRepository";
import { StaticServiceCatalogRepository } from "../src/infrastructure/content/repositories/StaticServiceCatalogRepository";

/**
 * THE SEED CONSTRUCTS ITS OWN REPOSITORIES, AND NEVER IMPORTS THE COMPOSITION ROOT.
 *
 * This is not tidiness. `container` reads whatever CONTENT_SOURCE says, which after the
 * first successful seed is the DATABASE — so a seed that went through it would be copying
 * the database onto itself. Every run would report success, `--force` would restore
 * nothing, and the one command whose whole job is "the files are right, the database is
 * wrong" would be the one command that could not do it. It failed exactly that way once.
 *
 * These are the file-backed implementations by name, so "seed from the content modules"
 * is what the code says as well as what the command means.
 */
const files = {
  marketingContent: new StaticMarketingContentRepository(),
  serviceCatalog: new StaticServiceCatalogRepository(),
  process: new StaticProcessRepository(),
  engagement: new StaticEngagementRepository(),
  portfolio: new StaticPortfolioRepository(),
  about: new StaticAboutRepository(),
  contact: new StaticContactRepository(),
} as const;

const cms = new StaticCmsRepository(files);

const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry");

const ROOT = path.resolve(import.meta.dirname, "..");

// ---------------------------------------------------------------------------
// Environment. The runner is a script, so it reads .env.local itself — Next does
// that for the app, and nothing else should have to know the variable names.
// ---------------------------------------------------------------------------

function loadEnvLocal(): void {
  let text: string;
  try {
    text = readFileSync(path.join(ROOT, ".env.local"), "utf8");
  } catch {
    return;
  }
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key !== "" && !process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

// ---------------------------------------------------------------------------
// Counting, so the run reports what it did rather than that it finished.
// ---------------------------------------------------------------------------

const counts = new Map<string, number>();

/**
 * WHAT THE REPORT CAN HONESTLY SAY.
 *
 * Not "inserted" and "updated". This server answers `affectedRows: 1` for an insert AND
 * for an upsert that matched, and mysql2 does not fill in `changedRows` for
 * INSERT ... ON DUPLICATE KEY UPDATE — so neither can be told from the other, and a report
 * claiming otherwise would be one that lies quietly. What IS knowable is how many
 * statements ran and, from a COUNT(*) afterwards, how many rows each table ended up with.
 * Those two are what it prints.
 */
function count(table: string): void {
  counts.set(table, (counts.get(table) ?? 0) + 1);
}

async function run(
  connection: Connection,
  table: string,
  sql: string,
  values: ReadonlyArray<string | number | null>,
): Promise<number> {
  count(table);
  if (dryRun) return 0;
  const [result] = await connection.execute(sql, [...values]);
  return (result as mysql.ResultSetHeader).insertId;
}

// ---------------------------------------------------------------------------
// content_strings — the same statement for every string on the site.
// ---------------------------------------------------------------------------

type OwnerKind = "page_section" | "collection_record" | "media_asset";

/**
 * `value` and `version` are absent from the UPDATE clause on purpose: a re-seed refreshes
 * what a field IS and never what it SAYS. `--force` swaps in the other statement.
 */
const UPSERT_STRING = `
  INSERT INTO content_strings
    (owner_kind, owner_key, field_key, label, value, value_kind, list_key, sort_order,
     is_approved, is_editable, read_only_reason, source_file, source_symbol, source_path)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    label = VALUES(label),
    value_kind = VALUES(value_kind),
    list_key = VALUES(list_key),
    sort_order = VALUES(sort_order),
    is_approved = VALUES(is_approved),
    is_editable = VALUES(is_editable),
    read_only_reason = VALUES(read_only_reason),
    source_file = VALUES(source_file),
    source_symbol = VALUES(source_symbol),
    source_path = VALUES(source_path)
`;

const UPSERT_STRING_FORCED = UPSERT_STRING.replace(
  "ON DUPLICATE KEY UPDATE\n    label = VALUES(label),",
  "ON DUPLICATE KEY UPDATE\n    label = VALUES(label),\n    value = VALUES(value),\n    version = version + 1,",
);

async function seedValue(
  connection: Connection,
  ownerKind: OwnerKind,
  ownerKey: string,
  value: CmsValue,
  listKey: string | null,
  sortOrder: number,
): Promise<void> {
  await run(connection, "content_strings", force ? UPSERT_STRING_FORCED : UPSERT_STRING, [
    ownerKind,
    ownerKey,
    value.id,
    value.label,
    value.value,
    value.kind,
    listKey,
    sortOrder,
    value.approval === "client" ? 1 : 0,
    value.pointer ? 1 : 0,
    value.readOnlyReason ?? null,
    value.pointer?.file ?? null,
    value.pointer?.symbol ?? null,
    value.pointer ? JSON.stringify(value.pointer.path) : null,
  ]);
}

/**
 * Every string a record owns, in the order the store was first written in: the record's own
 * values across all its groups, then every named list, then the media alt text.
 *
 * The two passes across groups rather than one pass per group are deliberate and have to stay
 * that way — that is the order the field keys were allocated in when the database was first
 * seeded, and `records.ts` allocates them the same way. Reordering here would rename rows.
 *
 * Nested item records are NOT followed. A capability shown inside the Creative Services page is
 * stored as a collection record with an address of its own, and is seeded as one.
 */
async function seedRecordStrings(
  connection: Connection,
  ownerKind: OwnerKind,
  ownerKey: string,
  record: CmsRecord,
): Promise<void> {
  let order = 0;
  for (const group of record.groups) {
    for (const value of group.values) {
      await seedValue(connection, ownerKind, ownerKey, value, null, order++);
    }
  }
  for (const group of record.groups) {
    for (const list of group.lists) {
      for (const item of list.items) {
        await seedValue(connection, ownerKind, ownerKey, item, listKeyOf(list.label), order++);
      }
    }
  }
  for (const group of record.groups) {
    for (const media of group.media) {
      await seedValue(connection, ownerKind, ownerKey, media.alt, null, order++);
    }
  }
}

/** `list_key` groups a list's items back together. It is the list's label, slugged. */
function listKeyOf(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Every nested card in the model, with the collection address it is stored under. */
async function collectionRecords(): Promise<
  ReadonlyArray<{ readonly key: string; readonly record: CmsRecord }>
> {
  const found = new Map<string, CmsRecord>();
  const walk = (record: CmsRecord): void => {
    for (const group of record.items) {
      for (const nested of group.records) {
        if (nested.address?.kind === "collection_record") {
          found.set(nested.address.key, nested);
        }
        walk(nested);
      }
    }
  };
  for (const page of await cms.getPages()) {
    for (const section of page.sections) walk(section);
  }
  return [...found.entries()].map(([key, record]) => ({ key, record }));
}

// ---------------------------------------------------------------------------
// Pages and their sections.
// ---------------------------------------------------------------------------

async function seedPages(connection: Connection): Promise<void> {
  const pages = await cms.getPages();

  for (const [pageIndex, page] of pages.entries()) {
    const pageId = await run(
      connection,
      "pages",
      `INSERT INTO pages (page_key, title, route, description, source_file, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title), route = VALUES(route), description = VALUES(description),
         source_file = VALUES(source_file), sort_order = VALUES(sort_order),
         id = LAST_INSERT_ID(id)`,
      [page.id, page.title, page.route, page.description, page.source, pageIndex],
    );

    for (const [sectionIndex, section] of page.sections.entries()) {
      await run(
        connection,
        "page_sections",
        `INSERT INTO page_sections (page_id, section_key, title, summary, sort_order)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title), summary = VALUES(summary), sort_order = VALUES(sort_order)`,
        [pageId, section.id, section.title, section.summary, sectionIndex],
      );
      await seedRecordStrings(connection, "page_section", `${page.id}:${section.id}`, section);
    }
  }
}

// ---------------------------------------------------------------------------
// Collections. The strings come from the CMS model; the structure from the entities.
// ---------------------------------------------------------------------------

async function seedCollectionStrings(connection: Connection): Promise<void> {
  for (const entry of await collectionRecords()) {
    await seedRecordStrings(connection, "collection_record", entry.key, entry.record);
  }
}

async function seedCaseStudies(connection: Connection): Promise<void> {
  const [summaries, page] = await Promise.all([
    files.portfolio.getCaseStudies(),
    files.portfolio.getSelectedWorkPage(),
  ]);
  const detailBySlug = new Map(page.pieces.map((piece) => [piece.slug.value, piece]));

  for (const [index, summary] of summaries.entries()) {
    const slug = summary.slug.value;
    const detail = detailBySlug.get(slug);
    const detailMedia = detail?.media ?? summary.media;

    const id = await run(
      connection,
      "case_studies",
      `INSERT INTO case_studies
         (slug, reference, home_media_path, home_media_kind, home_media_ratio,
          detail_media_path, detail_media_kind, detail_media_ratio, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         reference = VALUES(reference),
         home_media_path = VALUES(home_media_path), home_media_kind = VALUES(home_media_kind),
         home_media_ratio = VALUES(home_media_ratio),
         detail_media_path = VALUES(detail_media_path), detail_media_kind = VALUES(detail_media_kind),
         detail_media_ratio = VALUES(detail_media_ratio), sort_order = VALUES(sort_order),
         id = LAST_INSERT_ID(id)`,
      [
        slug,
        summary.reference,
        summary.media.src.value,
        summary.media.kind,
        summary.media.aspectRatio,
        detailMedia.src.value,
        detailMedia.kind,
        detailMedia.aspectRatio,
        index,
      ],
    );

    if (detail && !dryRun) {
      // Replace rather than merge: the join IS the list, and a capability removed from a
      // piece has to disappear rather than linger because nothing deleted it.
      await connection.execute("DELETE FROM case_study_capabilities WHERE case_study_id = ?", [id]);
      for (const [order, reference] of detail.capabilities.entries()) {
        const capabilitySlug = reference.href.split("#")[1] ?? "";
        await run(
          connection,
          "case_study_capabilities",
          `INSERT INTO case_study_capabilities (case_study_id, capability_id, sort_order)
           SELECT ?, id, ? FROM capabilities WHERE slug = ?`,
          [id, order, capabilitySlug],
        );
      }
    }
  }
}

async function seedCapabilities(connection: Connection): Promise<void> {
  const page = await files.serviceCatalog.getCreativeServicesPage();
  for (const [index, capability] of page.capabilities.entries()) {
    await run(
      connection,
      "capabilities",
      `INSERT INTO capabilities (slug, media_path, media_kind, media_ratio, sort_order)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         media_path = VALUES(media_path), media_kind = VALUES(media_kind),
         media_ratio = VALUES(media_ratio), sort_order = VALUES(sort_order)`,
      [
        capability.slug.value,
        capability.media.src.value,
        capability.media.kind,
        capability.media.aspectRatio,
        index,
      ],
    );
  }
}

async function seedProcessSteps(connection: Connection): Promise<void> {
  const page = await files.process.getHowWeWorkPage();
  for (const [index, step] of page.steps.entries()) {
    await run(
      connection,
      "process_steps",
      `INSERT INTO process_steps (slug, media_path, media_kind, media_ratio, sort_order)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         media_path = VALUES(media_path), media_kind = VALUES(media_kind),
         media_ratio = VALUES(media_ratio), sort_order = VALUES(sort_order)`,
      [step.slug.value, step.media.src.value, step.media.kind, step.media.aspectRatio, index],
    );
  }
}

async function seedEngagementTiers(connection: Connection): Promise<void> {
  const page = await files.engagement.getWaysToWorkPage();
  const all = [...page.tiers, page.custom];
  for (const [index, tier] of all.entries()) {
    await run(
      connection,
      "engagement_tiers",
      `INSERT INTO engagement_tiers (slug, is_custom, media_path, media_kind, media_ratio, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_custom = VALUES(is_custom), media_path = VALUES(media_path),
         media_kind = VALUES(media_kind), media_ratio = VALUES(media_ratio),
         sort_order = VALUES(sort_order)`,
      [
        tier.slug.value,
        index === all.length - 1 ? 1 : 0,
        tier.media.src.value,
        tier.media.kind,
        tier.media.aspectRatio,
        index,
      ],
    );
  }
}

/**
 * The FAQ, and where each question is asked.
 *
 * The homepage block defines the shared questions; the three inner pages each reuse some
 * of them and add their own. `faq_placements` is that arrangement, so an answer edited
 * once still changes everywhere the question appears — which is what the content files do
 * today by calling reusedFaq() instead of retyping.
 */
async function seedFaq(connection: Connection): Promise<void> {
  const questions = (await collectionRecords()).filter((entry) => entry.key.startsWith("faq:"));
  const idByKey = new Map<string, number>();

  for (const [index, entry] of questions.entries()) {
    const record = entry.record;
    const hasCta = record.groups.some((group) =>
      group.values.some((value) => value.kind === "ctaLabel"),
    );
    const id = await run(
      connection,
      "faq_items",
      `INSERT INTO faq_items (faq_key, owner, has_cta, sort_order)
       VALUES (?, 'home', ?, ?)
       ON DUPLICATE KEY UPDATE
         has_cta = VALUES(has_cta), sort_order = VALUES(sort_order), id = LAST_INSERT_ID(id)`,
      [record.id, hasCta ? 1 : 0, index],
    );
    idByKey.set(record.id, id);
    await run(
      connection,
      "faq_placements",
      `INSERT INTO faq_placements (page_key, faq_id, sort_order) VALUES ('home', ?, ?)
       ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)`,
      [id, index],
    );
  }
}

// ---------------------------------------------------------------------------
// Media. The files stay on disk; what is stored is the part that is content.
// ---------------------------------------------------------------------------

/**
 * The media library is read straight off `public/media` rather than through the panel.
 *
 * It used to come from a CMS screen that listed every file on disk with the records pointing at
 * it. That screen is gone — a picture is now shown beside the alt text of the block that carries
 * it, which is where someone writing alt text actually needs to see it — but the table it fed is
 * still useful, so the seed reads the directory itself.
 */
async function seedMedia(connection: Connection): Promise<void> {
  for (const file of readMediaDirectory("public/media")) {
    const extension = file.name.includes(".") ? file.name.split(".").pop() ?? "" : "";
    await run(
      connection,
      "media_assets",
      `INSERT INTO media_assets (file_name, path, extension, byte_size)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         path = VALUES(path), extension = VALUES(extension), byte_size = VALUES(byte_size)`,
      [file.name, `/media/${file.name}`, extension, file.byteSize],
    );
  }
}

// ---------------------------------------------------------------------------

/**
 * The table name is interpolated, which is the one place in the project that happens. It
 * is safe because the only values it can take are the literal names this file itself
 * passed to `count()` — nothing from outside the process reaches it — and it is checked
 * against that set before it is used.
 */
async function rowCount(connection: Connection, table: string): Promise<number> {
  if (!/^[a-z_]+$/.test(table)) throw new Error(`Refusing to count "${table}".`);
  const [result] = await connection.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
  return Number((result as Array<{ total: number }>)[0]?.total ?? 0);
}

async function main(): Promise<void> {
  const missing = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"].filter(
    (name) => !process.env[name],
  );
  if (missing.length > 0) {
    console.error(`Missing ${missing.join(", ")}. Copy .env.example to .env.local.`);
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    charset: "utf8mb4_unicode_ci",
  });

  console.log(`Seeding ${process.env.DB_NAME} on ${process.env.DB_HOST}.`);
  if (dryRun) console.log("Dry run — nothing will be written.\n");
  if (force) console.log("--force: every value will be reset to what the content files say.\n");

  await connection.beginTransaction();
  try {
    await seedPages(connection);
    // Capabilities first: case_study_capabilities resolves a capability by slug, and a
    // piece of work would otherwise link to nothing on a first run.
    await seedCapabilities(connection);
    await seedCaseStudies(connection);
    await seedProcessSteps(connection);
    await seedEngagementTiers(connection);
    await seedFaq(connection);
    await seedCollectionStrings(connection);
    await seedMedia(connection);
    if (dryRun) await connection.rollback();
    else await connection.commit();

    console.log("");
    for (const [table, statements] of [...counts.entries()].sort()) {
      const total = dryRun ? "—" : String(await rowCount(connection, table));
      console.log(
        `  ${table.padEnd(24)} ${String(statements).padStart(4)} statements  ${total.padStart(5)} rows`,
      );
    }
    console.log("");
  } catch (error: unknown) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? ((error as { sqlMessage?: string }).sqlMessage ?? error.message) : "";
  console.error(`Seed failed: ${message}`);
  process.exit(1);
});
