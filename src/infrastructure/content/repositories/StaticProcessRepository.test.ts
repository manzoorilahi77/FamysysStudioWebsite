import { describe, expect, it } from "vitest";
import { faqBlock, processBlock } from "../static/marketing.content";
import { caseStudies } from "../static/portfolio.content";
import { StaticProcessRepository } from "./StaticProcessRepository";

const STEP_TITLES = ["Understand", "Create", "Produce", "Refine", "Deliver"];

/** The brief's own shape: two or three concrete items in each of a step's two lists. */
const MIN_LIST_ITEMS = 2;
const MAX_LIST_ITEMS = 3;

describe("StaticProcessRepository — How We Work page", () => {
  // The whole point of the content file's structure: the expanded copy is drafted, but
  // the approved step names and descriptions are read from the homepage's process block
  // rather than retyped beside it. If someone ever inlines a literal title or
  // description, this is the test that catches it.
  it("carries the approved step titles and descriptions through unchanged", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    expect(page.steps.map((step) => step.title)).toEqual(STEP_TITLES);
    expect(page.steps.map((step) => step.title)).toEqual(processBlock.steps.map((s) => s.title));
    expect(page.steps.map((step) => step.description)).toEqual(
      processBlock.steps.map((step) => step.description),
    );
  });

  it("takes the hero heading from the brief's process line rather than restating it", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    expect(page.hero.heading).toBe(processBlock.heading);
  });

  it("slugs every step, uniquely, for the overview's jump links", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    const slugs = page.steps.map((step) => step.slug.value);
    expect(slugs).toEqual(["understand", "create", "produce", "refine", "deliver"]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every step expanded copy and an image with alt text", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    for (const step of page.steps) {
      expect(step.expandedCopy.trim().length).toBeGreaterThan(0);
      expect(step.media.alt.trim().length).toBeGreaterThan(0);
      expect(step.media.src.value).toMatch(/^\/media\/[a-z0-9-]+\.jpg$/);
    }
  });

  it("lists 2 to 3 items in both of each step's lists, with no blanks or duplicates", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    for (const step of page.steps) {
      for (const list of [step.whatWeNeed, step.whatYouGet]) {
        expect(list.length).toBeGreaterThanOrEqual(MIN_LIST_ITEMS);
        expect(list.length).toBeLessThanOrEqual(MAX_LIST_ITEMS);
        expect(list.every((item) => item.trim().length > 0)).toBe(true);
        expect(new Set(list).size).toBe(list.length);
      }
    }
  });

  it("walks the worked example through every step, in order, naming a real portfolio piece", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    expect(page.workedExample.stages.map((stage) => stage.stepTitle)).toEqual(STEP_TITLES);

    const piece = caseStudies.find(
      (candidate) => candidate.title === page.workedExample.pieceTitle,
    );
    expect(piece).toBeDefined();
    expect(page.workedExample.pieceDescription).toBe(piece?.description);
  });

  // The piece has not been produced. The disclaimer is rendered copy, not a code comment,
  // so it has to survive an edit to the content file.
  it("labels the worked example illustrative in visible copy", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    expect(page.workedExample.illustrativeNote.toLowerCase()).toContain("illustrative");
  });

  it("answers the scope question the Refine step raises", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    const refine = page.steps.find((step) => step.title === "Refine");
    expect(refine?.description).toContain("agreed scope");
    expect(page.scope.topics.length).toBeGreaterThanOrEqual(3);
    expect(page.scope.topics.every((topic) => topic.body.trim().length > 0)).toBe(true);
  });

  it("reuses two of the brief's FAQ answers verbatim and adds two", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    const items = page.faq.block.items;
    expect(items).toHaveLength(4);

    const briefQuestions = new Set(faqBlock.items.map((item) => item.question));
    const reused = items.filter((item) => briefQuestions.has(item.question));
    expect(reused.map((item) => item.question)).toEqual([
      "Can you do a sample before we commit?",
      "Do you offer ongoing monthly support?",
    ]);
    for (const item of reused) {
      const original = faqBlock.items.find((candidate) => candidate.question === item.question);
      expect(item.answer).toBe(original?.answer);
    }
  });

  it("keeps the page free of pricing", async () => {
    const page = await new StaticProcessRepository().getHowWeWorkPage();

    const everyString = JSON.stringify(page);

    expect(everyString).not.toMatch(/[$£€]\s?\d|\bprice[sd]?\b|\bpricing\b|\bper month\b/i);
  });
});
