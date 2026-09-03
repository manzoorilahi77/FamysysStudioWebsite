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
    expect(page.approach.intro).toBe(aboutBlock.approach);
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

  // The brief says to keep this page short. It grew from five sections to eight because
  // "short" had become "empty" — but the shape is still asserted, so the next edit that
  // wants a ninth block has to come here and say why.
  it("has exactly the eight blocks the redesign specifies, in order", async () => {
    const page = await new StaticAboutRepository().getAboutPage();

    expect(Object.keys(page)).toEqual([
      "hero",
      "belief",
      "approach",
      "inputs",
      "building",
      "ecosystem",
      "direction",
      "closingCta",
    ]);
    expect(page.approach.claims).toHaveLength(3);
    expect(page.inputs.inputs).toHaveLength(3);
    expect(page.building.stages).toHaveLength(3);
    expect(page.ecosystem.paragraphs.length).toBeLessThanOrEqual(4);
  });

  // The substance of the page: every claim is paired with what it means in practice,
  // every input says where it STOPS as well as what it gives, and the build order carries
  // the caveat about what is not ready yet. Each of these is the half that makes the
  // other half honest, so none may be empty.
  it("pairs every claim, input and stage with its honest half", async () => {
    const page = await new StaticAboutRepository().getAboutPage();

    for (const claim of page.approach.claims) {
      expect(claim.claim.trim().length).toBeGreaterThan(40);
      expect(claim.practice.trim().length).toBeGreaterThan(40);
    }
    for (const input of page.inputs.inputs) {
      expect(input.contributes.trim().length).toBeGreaterThan(40);
      expect(input.stops.trim().length).toBeGreaterThan(40);
      expect(input.contributesLabel.trim().length).toBeGreaterThan(0);
      expect(input.stopsLabel.trim().length).toBeGreaterThan(0);
    }
    for (const stage of page.building.stages) {
      expect(stage.status.trim().length).toBeGreaterThan(0);
      expect(stage.body.trim().length).toBeGreaterThan(40);
    }
    expect(page.building.caveat).toMatch(/not ready yet/i);
  });

  // Six images across eight sections, and none of them shows a crew, a face presented as
  // staff, or premises. The rule is "production, not people": at most one person in any
  // frame. The list is asserted so a seventh image is a decision, not a drift.
  it("carries six images, each with real alt text", async () => {
    const page = await new StaticAboutRepository().getAboutPage();

    const media = [
      page.hero.media,
      ...page.approach.claims.map((claim) => claim.media),
      page.ecosystem.media,
      page.direction.media,
    ];
    expect(media.map((item) => item.src.value)).toEqual([
      "/media/about-hero.jpg",
      "/media/about-claim-creative.jpg",
      "/media/about-claim-workflow.jpg",
      "/media/about-approach.jpg",
      "/media/about-ecosystem.jpg",
      "/media/about-direction.jpg",
    ]);
    for (const item of media) {
      expect(item.alt.trim().length).toBeGreaterThan(20);
    }
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
    expect(draftedStrings().length).toBeGreaterThan(30);
  });
});
