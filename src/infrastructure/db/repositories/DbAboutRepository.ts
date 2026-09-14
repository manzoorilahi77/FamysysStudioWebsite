import type { AboutPage } from "../../../domain/about/entities/AboutPage";
import type { AboutRepository } from "../../../domain/about/repositories/AboutRepository";
import { StaticAboutRepository } from "../../content/repositories/StaticAboutRepository";
import { ContentStore } from "../content/ContentStore";
import { closingCta } from "./DbMarketingContentRepository";
import { pageMedia } from "./shared";

/**
 * /about, read from the database.
 *
 * The page carries six images and no collection, so it is the simplest of the five: every
 * field below is a string, and the only thing taken from the module is each image slot's
 * aspect ratio — see `pageMedia` in `./shared` for the file and alt text.
 *
 * `contributesLabel` and `stopsLabel` are per-panel in the entity but one pair of words
 * on the page — the panel edits them once, under the section, and they are applied to all
 * three inputs here, which is what the content module does too.
 */
export class DbAboutRepository implements AboutRepository {
  private readonly structure = new StaticAboutRepository();

  async getAboutPage(): Promise<AboutPage> {
    const shape = await this.structure.getAboutPage();
    const store = await ContentStore.load("page_section", ["about:"], { prefix: true });

    const hero = "about:hero";
    const belief = "about:belief";
    const approach = "about:approach";
    const inputs = "about:inputs";
    const building = "about:building";
    const ecosystem = "about:ecosystem";
    const direction = "about:direction";

    const claimTitles = store.list(approach, "claim-titles");
    const claims = store.list(approach, "claims");
    const practice = store.list(approach, "in-practice");

    const panelNames = store.list(inputs, "panel-names");
    const contributes = store.list(inputs, "contributes");
    const stopsAt = store.list(inputs, "stops-at");

    const stageTitles = store.list(building, "stage-titles");
    const stageStatuses = store.list(building, "stage-statuses");
    const stageBodies = store.list(building, "stage-bodies");

    return {
      hero: {
        eyebrow: store.text(hero, "eyebrow"),
        heading: store.text(hero, "heading"),
        body: store.text(hero, "body"),
        media: pageMedia(store, hero, 0, shape.hero.media.aspectRatio),
      },
      belief: {
        label: store.text(belief, "label"),
        statement: store.text(belief, "statement"),
      },
      approach: {
        eyebrow: store.text(approach, "eyebrow"),
        heading: store.text(approach, "heading"),
        intro: store.text(approach, "intro"),
        practiceLabel: store.text(approach, "practice-label"),
        claims: claimTitles.map((title, index) => ({
          title,
          claim: claims[index] ?? "",
          practice: practice[index] ?? "",
          media: pageMedia(
            store,
            approach,
            index,
            shape.approach.claims[index]?.media.aspectRatio ?? shape.hero.media.aspectRatio,
          ),
        })),
      },
      inputs: {
        eyebrow: store.text(inputs, "eyebrow"),
        heading: store.text(inputs, "heading"),
        body: store.text(inputs, "body"),
        inputs: panelNames.map((name, index) => ({
          name,
          contributes: contributes[index] ?? "",
          stops: stopsAt[index] ?? "",
          contributesLabel: shape.inputs.inputs[index]?.contributesLabel ?? "",
          stopsLabel: shape.inputs.inputs[index]?.stopsLabel ?? "",
        })),
      },
      building: {
        eyebrow: store.text(building, "eyebrow"),
        heading: store.text(building, "heading"),
        body: store.text(building, "body"),
        caveat: store.text(building, "caveat"),
        stages: stageTitles.map((title, index) => ({
          title,
          status: stageStatuses[index] ?? "",
          body: stageBodies[index] ?? "",
        })),
      },
      ecosystem: {
        eyebrow: store.text(ecosystem, "eyebrow"),
        heading: store.text(ecosystem, "heading"),
        paragraphs: store.list(ecosystem, "paragraphs"),
        media: pageMedia(store, ecosystem, 0, shape.ecosystem.media.aspectRatio),
        link: store.cta(ecosystem, "link"),
      },
      direction: {
        eyebrow: store.text(direction, "eyebrow"),
        heading: store.text(direction, "heading"),
        ambitionLabel: store.text(direction, "ambition-label"),
        ambition: store.text(direction, "ambition"),
        presentLabel: store.text(direction, "present-label"),
        present: store.text(direction, "present"),
        media: pageMedia(store, direction, 0, shape.direction.media.aspectRatio),
      },
      closingCta: closingCta(store, "about:closing-cta"),
    };
  }
}
