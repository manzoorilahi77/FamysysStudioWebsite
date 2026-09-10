import { describe, expect, it } from "vitest";
import { StaticMarketingContentRepository } from "./StaticMarketingContentRepository";

describe("StaticMarketingContentRepository", () => {
  it("returns hero content with two CTAs and six labelled accordion bands", async () => {
    const repository = new StaticMarketingContentRepository();

    const hero = await repository.getHero();

    expect(hero.heading.length).toBeGreaterThan(0);
    expect(hero.body.length).toBeGreaterThan(0);
    expect(hero.supportingLine.length).toBeGreaterThan(0);
    expect(hero.primaryCta.label.value).toBe("Start a Conversation");
    expect(hero.secondaryCta.label.value).toBe("Explore Our Services");
    // Six slots, one per band, so real stills drop in one-for-one — see docs/content-todo.md.
    // The labels are the manager's six, in the order Hero.tsx's phone subset depends on.
    expect(hero.bands).toHaveLength(6);
    expect(hero.bands.map((band) => band.label)).toEqual([
      "Graphic Design",
      "Video Editing",
      "Reels & Shorts",
      "AI Content Creation",
      "Motion Graphics",
      "Brand Visuals",
    ]);
  });

  it("returns a What We Do intro with an eyebrow, heading, body and CTA", async () => {
    const repository = new StaticMarketingContentRepository();

    const whatWeDo = await repository.getWhatWeDoIntro();

    expect(whatWeDo.intro.eyebrow).toBe("Our capabilities");
    expect(whatWeDo.intro.heading.length).toBeGreaterThan(0);
    expect(whatWeDo.intro.body.length).toBeGreaterThan(0);
    expect(whatWeDo.cta.label.value).toBe("Explore All Services");
  });

  it("returns exactly 4 differentiator elements and the thesis statement", async () => {
    const repository = new StaticMarketingContentRepository();

    const differentiator = await repository.getDifferentiatorBlock();

    expect(differentiator.elements).toHaveLength(4);
    expect(differentiator.elements.map((element) => element.title)).toEqual([
      "Human Creativity",
      "Intelligent AI Workflows",
      "Professional Production",
      "Efficient Delivery",
    ]);
    expect(differentiator.closingStatement).toBe("AI is our production advantage not our identity");
  });

  it("gives every differentiator element its own image, in element order", async () => {
    const repository = new StaticMarketingContentRepository();

    const differentiator = await repository.getDifferentiatorBlock();

    expect(differentiator.elements.map((element) => element.media.src.value)).toEqual([
      "/media/element-01.jpg",
      "/media/element-02.jpg",
      "/media/element-03.jpg",
      "/media/element-04.jpg",
    ]);
    for (const element of differentiator.elements) {
      expect(element.media.kind).toBe("image");
      expect(element.media.alt.length).toBeGreaterThan(0);
    }
  });

  it("returns exactly 5 process steps in the brief's order", async () => {
    const repository = new StaticMarketingContentRepository();

    const process = await repository.getProcessBlock();

    expect(process.steps).toHaveLength(5);
    expect(process.steps.map((step) => step.title)).toEqual([
      "Understand",
      "Create",
      "Produce",
      "Refine",
      "Deliver",
    ]);
  });

  it("returns three engagement tiers plus a custom partnership, with no pricing", async () => {
    const repository = new StaticMarketingContentRepository();

    const waysToWork = await repository.getWaysToWorkBlock();
    const everyString = [
      waysToWork.heading,
      waysToWork.body,
      ...waysToWork.tiers.flatMap((tier) => [
        tier.name,
        tier.descriptor,
        tier.summary,
        tier.idealFor,
        tier.typicalWork,
      ]),
      waysToWork.custom.summary,
      waysToWork.custom.invitation,
    ].join(" ");

    expect(waysToWork.tiers.map((tier) => tier.name)).toEqual(["Launch", "Grow", "Scale"]);
    expect(waysToWork.custom.name).toBe("Custom Creative Partnership");
    // "No public pricing anywhere" is an explicit instruction in the brief, so
    // it gets a test rather than a comment.
    expect(everyString).not.toMatch(/[$£€]\s?\d|\bprice[sd]?\b|\bpricing\b|\bper month\b/i);
  });

  it("returns a work intro", async () => {
    const repository = new StaticMarketingContentRepository();

    const intro = await repository.getWorkIntro();

    expect(intro.heading).toBe("Selected Creative Work");
    expect(intro.body.length).toBeGreaterThan(0);
  });

  it("returns exactly 5 Why Famysys reasons", async () => {
    const repository = new StaticMarketingContentRepository();

    const whyFamysys = await repository.getWhyFamysysBlock();

    expect(whyFamysys.reasons).toHaveLength(5);
    expect(whyFamysys.reasons.map((reason) => reason.title)).toEqual([
      "Flexible",
      "Efficient",
      "Human-led",
      "Scalable",
      "Value-driven",
    ]);
  });

  it("returns exactly 7 FAQ items, each with a question and an answer", async () => {
    const repository = new StaticMarketingContentRepository();

    const faq = await repository.getFaqBlock();

    expect(faq.items).toHaveLength(7);
    expect(faq.items.every((item) => item.question.trim().length > 0)).toBe(true);
    expect(faq.items.every((item) => item.answer.trim().length > 0)).toBe(true);
  });

  it("returns exactly one FAQ answer carrying an inline CTA", async () => {
    const repository = new StaticMarketingContentRepository();

    const faq = await repository.getFaqBlock();
    const withCta = faq.items.filter((item) => item.cta);

    expect(withCta).toHaveLength(1);
    expect(withCta[0]?.cta?.label.value).toBe("Talk to us about your project");
  });

  it("returns a closing CTA block with a CTA and closing line", async () => {
    const repository = new StaticMarketingContentRepository();

    const cta = await repository.getClosingCta();

    expect(cta.heading).toBe("Have a creative requirement? Let's talk.");
    expect(cta.body.length).toBeGreaterThan(0);
    expect(cta.cta.label.value).toBe("Start a Conversation");
    expect(cta.closingLine).toBe("Project today. Creative partner tomorrow.");
  });

  /**
   * THIS TEST USED TO ASSERT THE OPPOSITE, and the reversal is the point.
   *
   * The footer carried no legal row at all, because "Privacy policy" at /privacy and
   * "Terms of use" at /terms both 404ed and a broken privacy link is the wrong thing to
   * be broken on a site whose forms ask for a name, a company and an email. The footer
   * rebuild takes famysys.com's structure, which HAS that column, so the two links are
   * back and both still 404 — a defect held open deliberately, with the documents named
   * as the fix in docs/content-todo.md.
   *
   * What this asserts is that the state is the one that was chosen: exactly two links, at
   * exactly the two routes the pending-route exemption in internalLinks.test.ts names. A
   * third dead link, or a different route, is a mistake rather than the decision.
   */
  it("links the three legal pages the documents have not been written for yet", async () => {
    const repository = new StaticMarketingContentRepository();

    const footer = await repository.getFooterContent();

    expect(footer.legalLinks.map((link) => link.label.toString())).toEqual([
      "Terms & Conditions",
      "Privacy Policy",
      "FAQ",
    ]);
    expect(footer.legalLinks.map((link) => link.href.value)).toEqual([
      "/terms",
      "/privacy",
      "/faq",
    ]);
    expect(footer.contactEmail.length).toBeGreaterThan(0);
  });

  /**
   * THE CAPABILITY DECK IS NAMED BEFORE THE DECK EXISTS, which is only safe while pressing
   * it does something honest. `href` is null and the dialog copy is present: that pair is
   * what makes the label a button that says the deck is being prepared rather than a link
   * to nothing. The day a URL arrives this test fails, which is the reminder that the
   * dialog copy has stopped being reachable and the label is now a download.
   */
  it("names the capability deck with no file behind it yet, and copy for the dialog that stands in", async () => {
    const repository = new StaticMarketingContentRepository();

    const { capabilityDeck } = await repository.getFooterContent();

    expect(capabilityDeck.label.length).toBeGreaterThan(0);
    expect(capabilityDeck.href).toBeNull();
    expect(capabilityDeck.pending.eyebrow.length).toBeGreaterThan(0);
    expect(capabilityDeck.pending.body.length).toBeGreaterThan(0);
    expect(capabilityDeck.pending.closeLabel.length).toBeGreaterThan(0);
  });

  /**
   * The address is the one footer field where a wrong value is a factual claim about
   * where a business is, and it now prints on all seven pages. It used to be null and
   * this test asserted the absence; it asserts the exact lines instead, so a stray edit
   * to the street, the suite or the ZIP fails here rather than shipping a wrong address
   * site-wide.
   */
  it("prints the supplied postal address, line for line", async () => {
    const repository = new StaticMarketingContentRepository();

    const footer = await repository.getFooterContent();

    expect(footer.addressLines).toEqual([
      "10193 W Grand Parkway S.",
      "Ste. 103-229, Richmond,",
      "Texas 77447 United States",
    ]);
  });
});
