import { describe, expect, it } from "vitest";
import { aboutPage } from "../static/about.content";
import { aboutBlock, closingCta } from "../static/marketing.content";
import { StaticAboutRepository } from "./StaticAboutRepository";

/**
 * Keys holding a route, file path, enum or derived identifier rather than reviewable
 * copy. Mirrors `NON_COPY_KEYS` in scripts/generate-content-todo.mjs.
 */
const NON_COPY_KEYS = new Set(["href", "src", "poster", "kind", "aspectRatio", "slug"]);

function collectStrings(node: unknown, out: string[] = []): string[] {
  if (node && typeof node === "object" && "value" in node) {
    const inner = (node as { value: unknown }).value;
    if (typeof inner === "string") {
      out.push(inner);
      return out;
    }
  }
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const element of node) {
      collectStrings(element, out);
    }
    return out;
  }
  if (node && typeof node === "object") {
    for (const [key, child] of Object.entries(node)) {
      if (NON_COPY_KEYS.has(key)) {
        continue;
      }
      collectStrings(child, out);
    }
  }
  return out;
}

const APPROVED = new Set(collectStrings([aboutBlock, closingCta]));

function draftedStrings(): ReadonlyArray<string> {
  return collectStrings(aboutPage).filter((text) => !APPROVED.has(text));
}

describe("StaticAboutRepository — About page", () => {
  // Every string the brief supplies is read from `aboutBlock` rather than retyped
  // beside the draft. If someone inlines a literal, this is what catches it.
  it("carries the client's own About copy through unchanged", async () => {
    const page = await new StaticAboutRepository().getAboutPage();

    expect(page.hero.heading).toBe(aboutBlock.heading);
    expect(page.belief.statement).toBe(aboutBlock.belief);
    expect(page.approach.paragraphs[0]).toBe(aboutBlock.approach);
    expect(page.ecosystem.paragraphs[0]).toBe(aboutBlock.ecosystem);
    expect(page.direction.ambition).toBe(aboutBlock.ambition);
    expect(page.direction.present).toBe(aboutBlock.startingDeliberately);
    expect(page.closingCta.closingLine).toBe(closingCta.closingLine);
  });

  // The ambition and the present tense are one block precisely so they cannot be
  // separated. An ambition rendered alone reads as a description of today.
  it("keeps the ambition and the current position together", async () => {
    const page = await new StaticAboutRepository().getAboutPage();

    expect(page.direction.ambition.trim().length).toBeGreaterThan(0);
    expect(page.direction.present.trim().length).toBeGreaterThan(0);
    expect(page.direction.present).toMatch(/starting deliberately/i);
  });

  // The brief says to keep this page short. That is a content decision, so it is
  // asserted rather than left to whoever edits next.
  it("stays short — six blocks, and no block longer than three paragraphs", async () => {
    const page = await new StaticAboutRepository().getAboutPage();

    expect(Object.keys(page)).toEqual([
      "hero",
      "belief",
      "approach",
      "ecosystem",
      "direction",
      "closingCta",
    ]);
    expect(page.approach.paragraphs.length).toBeLessThanOrEqual(3);
    expect(page.ecosystem.paragraphs.length).toBeLessThanOrEqual(3);
  });

  // One image on the whole page, on the approach block, and none anywhere else. The
  // brief allows a second on the direction block; it was left out because a stock
  // photograph of strangers reads as "our team" on this page in a way it does not
  // elsewhere. If one is ever added, this test is where the decision gets revisited.
  it("carries exactly one image, with real alt text", async () => {
    const page = await new StaticAboutRepository().getAboutPage();

    const withMedia = Object.entries(page).filter(
      ([, block]) => block !== null && typeof block === "object" && "media" in block,
    );
    expect(withMedia.map(([name]) => name)).toEqual(["approach"]);
    expect(page.approach.media.src.value).toBe("/media/about-approach.jpg");
    expect(page.approach.media.alt.trim().length).toBeGreaterThan(20);
  });

  it("links out to the parent as an external link", async () => {
    const page = await new StaticAboutRepository().getAboutPage();

    expect(page.ecosystem.link.href.isExternal).toBe(true);
    expect(page.ecosystem.link.href.value).toMatch(/^https:\/\/famysys\.com/);
  });

  // THE constraint on this page. The studio is, in the brief's own words, still
  // starting. Anything that implies an established agency is false, not merely
  // over-claimed.
  it("invents no team, headcount, date, office, client count or award", async () => {
    const everything = collectStrings(aboutPage).join("\n");

    // No figures at all — a headcount, a founding year and a client count are digits.
    expect(everything).not.toMatch(/\d/);

    expect(everything).not.toMatch(
      /\b(founded|established in|since \w+|our team of|we are a team of|employees|staff of|headcount)\b/i,
    );
    // Office and premises claims. "India" is the client's own market statement in the
    // ambition sentence and is not an office claim, so the pattern targets premises.
    expect(everything).not.toMatch(
      /\b(headquartered|our (office|offices|studio space|premises)|based in|located (in|at))\b/i,
    );
    expect(everything).not.toMatch(
      /\b(award[- ]winning|award(s|ed)?\b|certified|accredited|partner of|official partner)\b/i,
    );
    expect(everything).not.toMatch(
      /\b(clients served|trusted by|hundreds of|thousands of|leading|industry[- ]leading|world[- ]class)\b/i,
    );
  });

  it("makes no operational or capability promise", async () => {
    const everything = draftedStrings().join("\n");

    expect(everything).not.toMatch(
      /\bturnaround\b|\bguarantee(d|s)?\b|\bany (volume|scale)\b|\bunlimited\b|\bcapacity\b/i,
    );
    expect(draftedStrings().length).toBeGreaterThan(8);
  });
});
