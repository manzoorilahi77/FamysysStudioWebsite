import type { ContactPage } from "../../../domain/contact/entities/ContactPage";
import type { ContactRepository } from "../../../domain/contact/repositories/ContactRepository";
import { ContentStore } from "../content/ContentStore";

/**
 * /contact, read from the database.
 *
 * `direct` stays empty. The brief supplies neither an email nor a phone number for the
 * Studio, and famysys.com's are the PARENT's — publishing a number that rings the wrong
 * desk is worse than publishing none. The panel shows the field read-only with that
 * reason, and there is nothing here to read until the client supplies one.
 *
 * The numerals on the next-steps panel are content, not indices — the entity says so —
 * but the studio's own copy numbers them 01, 02, 03 in order, so they are produced from
 * the position rather than stored three times.
 */
export class DbContactRepository implements ContactRepository {
  async getContactPage(): Promise<ContactPage> {
    const store = await ContentStore.load("page_section", ["contact:"], { prefix: true });

    const hero = "contact:hero";
    const form = "contact:form";
    const panel = "contact:next-steps";

    const labels = store.list(form, "field-labels");
    const headings = store.list(panel, "step-headings");
    const bodies = store.list(panel, "step-bodies");

    return {
      hero: {
        eyebrow: store.text(hero, "eyebrow"),
        heading: store.text(hero, "heading"),
        body: store.text(hero, "body"),
      },
      form: {
        heading: store.text(form, "heading"),
        labels: {
          fullName: labels[0] ?? "",
          email: labels[1] ?? "",
          companyName: labels[2] ?? "",
          companySize: labels[3] ?? "",
          brief: labels[4] ?? "",
        },
        selectPlaceholder: store.text(form, "select-placeholder"),
        submitLabel: store.text(form, "submit-label"),
        submittingLabel: store.text(form, "submitting-label"),
        confirmationHeading: store.text(form, "confirmation-heading"),
        confirmationBody: store.text(form, "confirmation-body"),
        submitErrorMessage: store.text(form, "submit-error"),
      },
      panel: {
        heading: store.text(panel, "heading"),
        steps: headings.map((heading, index) => ({
          numeral: String(index + 1).padStart(2, "0"),
          heading,
          body: bodies[index] ?? "",
        })),
        directEyebrow: store.text(panel, "direct-eyebrow"),
        tagline: store.text(panel, "tagline"),
        direct: {},
        closingLine: store.text(panel, "closing-line"),
      },
    };
  }
}
