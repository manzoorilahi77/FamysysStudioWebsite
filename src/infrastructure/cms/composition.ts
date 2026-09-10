import { readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import type { CmsRecord } from "../../domain/cms/entities/CmsRecord";
import { derivedId, toRecord } from "./records";

/**
 * WHICH BLOCKS A PAGE RENDERS, READ FROM THE PAGE.
 *
 * The sidebar used to list sections because a mapping file said so, which is the same
 * failure that put Blog and Testimonials in it: a screen existed because someone wrote one
 * down, not because the site had the thing. So the ORDER and the PRESENCE of a page's
 * sections are read out of the route file's own JSX. Add a block to /about tomorrow and it
 * appears in the panel with nothing edited here.
 *
 * WHAT IS STILL WRITTEN DOWN, AND WHY IT HAS TO BE. Nothing in `<HowWeWorkFrames />` says
 * it is the block an editor calls "How We Work" — a component name is not a content
 * address, and no amount of parsing turns one into the other. `SECTION_OF` is that one
 * mapping and nothing else: not the order, not the list, not whether a block is rendered.
 * A component missing from it still shows up, as a block with nothing mapped to it yet,
 * which is the honest thing for the panel to say about a section somebody just added.
 *
 * IT IS A FILESYSTEM READ, so it can fail: a standalone build has no `src/app` beside it.
 * Every function here returns `null` rather than throwing, `CmsPage.sectionsAreDerived`
 * carries which happened, and the Page screen says so on the page.
 */

const APP_ROOT = "src/app";

/**
 * SITE FURNITURE: rendered by every route, edited in one place or not at all.
 *
 * The header is the primary navigation, generated from the routes rather than written, so
 * there is nothing on it for an editor to change and it is never a section. The footer IS
 * editable, but its copy lives in the homepage's content file and it is listed once, under
 * Home — publishing it regenerates all seven pages, which is what `SITE_WIDE` in routes.ts
 * is for. So a page that renders one of these and does not map it is not a page with an
 * unmapped block; it is a page rendering furniture, and it is skipped rather than reported.
 */
const SITE_FURNITURE: ReadonlySet<string> = new Set(["Header", "Footer"]);

/**
 * Which React component renders which section, per page. The only hand-written table in
 * this file, and the only thing about the sidebar that is hand-written at all.
 */
export const SECTION_OF: Readonly<
  Record<string, Readonly<Record<string, ReadonlyArray<string>>>>
> = {
  home: {
    Hero: ["hero"],
    WhatWeDo: ["what-we-do"],
    Differentiator: ["differentiator"],
    HowWeWorkFrames: ["how-we-work"],
    WaysToWorkTiles: ["ways-to-work"],
    SelectedWorkCovers: ["selected-work"],
    WhyFamysys: ["why-famysys"],
    // No homepage component renders the shared FAQ block any more — /faq does — so it is
    // listed under Home as a block the page holds but does not render, with the note
    // saying so. It stays under Home because that is where the shared answers are edited.
    FinalCta: ["closing-cta"],
    Footer: ["footer"],
  },
  "creative-services": {
    ServicesHero: ["hero"],
    CapabilityIndex: ["capability-index"],
    CapabilityBlock: ["capabilities"],
    HowWeWork: ["process-pointer"],
    EngagementPointer: ["engagement-pointer"],
    FaqPointer: ["faq"],
    FinalCta: ["closing-cta"],
  },
  "how-we-work": {
    ProcessHero: ["hero"],
    ProcessOverview: ["process-overview"],
    ProcessStepBlock: ["process-steps"],
    WorkedExample: ["worked-example"],
    ScopeAndRevisions: ["scope-and-revisions"],
    FaqPointer: ["faq"],
    FinalCta: ["closing-cta"],
  },
  "ways-to-work-with-us": {
    EngagementHero: ["hero"],
    TierComparison: ["tier-comparison"],
    TierBlock: ["engagement-tiers"],
    CustomPartnershipBlock: ["custom-partnership"],
    HowToChoose: ["how-to-choose"],
    ScopingBlock: ["scoping"],
    FaqPointer: ["faq"],
    FinalCta: ["closing-cta"],
  },
  "selected-work": {
    WorkHero: ["hero"],
    WorkFraming: ["framing"],
    WorkGallery: ["filters", "gallery", "piece-detail"],
    WorkProgression: ["progression"],
    WorkCapabilityLinks: ["capability-links"],
    FinalCta: ["closing-cta"],
  },
  about: {
    AboutHero: ["hero"],
    BeliefStatement: ["belief"],
    AboutApproach: ["approach"],
    AboutInputs: ["inputs"],
    AboutBuilding: ["building"],
    PartOfFamysys: ["ecosystem"],
    WhereWereGoing: ["direction"],
    FinalCta: ["closing-cta"],
  },
  contact: {
    ContactHero: ["hero"],
    ContactFormSection: ["form", "next-steps"],
  },
};

/** The route file each page is rendered by, relative to `src/app`. */
export const PAGE_SOURCE: Readonly<Record<string, string>> = {
  home: "page.tsx",
  "creative-services": "creative-services/page.tsx",
  "how-we-work": "how-we-work/page.tsx",
  "ways-to-work-with-us": "ways-to-work-with-us/page.tsx",
  "selected-work": "selected-work/page.tsx",
  about: "about/page.tsx",
  contact: "contact/page.tsx",
};

/** Every capitalised JSX tag inside a node, in source order, first occurrence only. */
function componentsIn(node: ts.Node): ReadonlyArray<string> {
  const found: string[] = [];
  const visit = (current: ts.Node): void => {
    if (ts.isJsxOpeningElement(current) || ts.isJsxSelfClosingElement(current)) {
      const name = current.tagName.getText();
      if (/^[A-Z]/.test(name) && !found.includes(name)) {
        found.push(name);
      }
    }
    current.forEachChild(visit);
  };
  visit(node);
  return found;
}

/** The `<main>` element in a route file, which is where a page's blocks are. */
function findMain(source: ts.SourceFile): ts.Node | undefined {
  let main: ts.Node | undefined;
  const visit = (node: ts.Node): void => {
    if (main) return;
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText() === "main") {
      main = node;
      return;
    }
    node.forEachChild(visit);
  };
  visit(source);
  return main;
}

/**
 * The components a route renders, in order: everything inside `<main>`, then `Footer` when
 * the route renders one. The footer is outside `main` in every page — it is site furniture
 * rather than page content — but its words are editable, so it belongs in the list.
 */
export function readComposition(pageId: string): ReadonlyArray<string> | null {
  const relative = PAGE_SOURCE[pageId];
  if (!relative) return null;

  let text: string;
  try {
    text = readFileSync(join(process.cwd(), APP_ROOT, relative), "utf8");
  } catch {
    return null;
  }

  // TSX, not TS: the TypeScript parser reads `<main>` as a type assertion in a .ts file
  // and the whole tree comes back wrong rather than failing.
  const source = ts.createSourceFile(
    relative,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const main = findMain(source);
  if (!main) return null;

  const inside = componentsIn(main);
  const rest = componentsIn(source).filter(
    (name) => name === "Footer" && !inside.includes("Footer"),
  );
  return [...inside, ...rest].filter((name) => name !== "Header");
}

/**
 * The declared sections, put into the order the page renders them, plus anything the page
 * renders that the panel has nothing for.
 *
 * Three cases, and each one is visible rather than swallowed:
 *   - a component with sections mapped to it becomes those sections, in this position;
 *   - a component with none becomes a block that says so, which is what a section added to
 *     the page this morning looks like — it appears, and the panel says it has nothing
 *     mapped yet rather than pretending the page is shorter than it is;
 *   - a section declared here that the page no longer renders goes last, marked, rather
 *     than silently disappearing along with any drafts saved against it.
 */
export interface OrderedSections {
  readonly sections: ReadonlyArray<CmsRecord>;
  readonly derived: boolean;
}

const UNMAPPED_NOTE =
  "This page renders this block, but the panel has nothing mapped to it yet — so there is " +
  "nothing here to edit. It is listed because the list is read from the page itself, which " +
  "is how a block added to the site shows up here without anyone editing the CMS.";

const UNRENDERED_NOTE =
  "The panel knows this block, but this page does not currently render it. Its content is " +
  "still here and still editable — and may be rendered elsewhere: the homepage's FAQ " +
  "block, for one, is printed on /faq.";

export function orderSections(
  pageId: string,
  declared: ReadonlyArray<CmsRecord>,
): OrderedSections {
  const composition = readComposition(pageId);
  if (!composition) {
    return { sections: declared, derived: false };
  }

  const byId = new Map(declared.map((section) => [section.id, section]));
  const mapping = SECTION_OF[pageId] ?? {};
  const used = new Set<string>();
  const ordered: CmsRecord[] = [];

  for (const component of composition) {
    const ids = mapping[component];
    if (!ids || ids.length === 0) {
      if (!SITE_FURNITURE.has(component)) ordered.push(unmappedBlock(component));
      continue;
    }
    for (const id of ids) {
      const section = byId.get(id);
      if (section) {
        used.add(id);
        ordered.push(section);
      }
    }
  }

  const unrendered = declared
    .filter((section) => !used.has(section.id))
    .map((section) => ({ ...section, note: UNRENDERED_NOTE }));

  return { sections: [...ordered, ...unrendered], derived: true };
}

function unmappedBlock(component: string): CmsRecord {
  return toRecord({
    id: derivedId(component),
    title: component,
    summary: "Rendered by the page. Nothing mapped to it yet.",
    updatedAt: null,
    note: UNMAPPED_NOTE,
  });
}
