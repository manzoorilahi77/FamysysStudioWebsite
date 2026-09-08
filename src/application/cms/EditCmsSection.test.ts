import { describe, expect, it } from "vitest";
import type { CmsPage } from "../../domain/cms/entities/CmsPage";
import { ContentConflictError } from "../../domain/cms/repositories/CmsRepository";
import { DiscardCmsDrafts, PublishCmsSection, SaveCmsSection } from "./EditCmsSection";
import { FakeCmsRepository, fakePage, fakeRecord, fakeValue } from "./__fakes__/FakeCmsRepository";

/**
 * The three steps, and the promise each of them makes.
 *
 * Save writes a draft and NOTHING invalid, ever, even partially. Publish moves what was
 * saved and reports exactly which routes now need regenerating. Discard throws the drafts
 * away. The fake records what it was asked to do rather than doing it, which is the only
 * way "nothing was written" is observable.
 */

const capability = fakeRecord({
  id: "creative-design",
  title: "Creative Design",
  address: { kind: "collection_record", key: "capabilities:creative-design" },
  values: [
    fakeValue({ id: "descriptor", label: "Descriptor", value: "Brand systems." }),
    fakeValue({
      id: "cta-link",
      label: "CTA link",
      value: "/contact",
      kind: "url",
      version: 4,
    }),
  ],
});

function homepage(): CmsPage {
  return fakePage({
    id: "home",
    route: "/",
    title: "Home",
    sections: [
      {
        ...fakeRecord({
          id: "what-we-do",
          title: "What We Do",
          address: { kind: "page_section", key: "home:what-we-do" },
          values: [
            fakeValue({ id: "heading", label: "Heading", value: "What we do", version: 2 }),
            fakeValue({
              id: "locked",
              label: "Reference",
              value: "01",
              readOnlyReason: "Generated from the piece's position in the list.",
            }),
          ],
        }),
        items: [
          {
            id: "items-capabilities",
            label: "Capabilities",
            collectionId: "capabilities",
            addNoun: "a capability",
            records: [capability],
          },
        ],
      },
    ],
  });
}

const target = { pageId: "home", sectionId: "what-we-do" };

function subject() {
  const repository = new FakeCmsRepository([homepage()]);
  return { repository, save: new SaveCmsSection(repository) };
}

describe("saving a section", () => {
  it("writes only the fields that changed, addressed by the record they are on", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [
      { valueId: "heading", value: "What we actually do", version: 2 },
      // Unchanged: it should not become a draft, because a draft is what marks the
      // section as having unpublished work on it.
      { recordId: "creative-design", valueId: "cta-link", value: "/contact", version: 4 },
      { recordId: "creative-design", valueId: "descriptor", value: "Brand systems, end to end." },
    ]);

    expect(result).toMatchObject({ ok: true, saved: 2 });
    expect(repository.written).toHaveLength(1);
    expect(repository.written[0]?.map((edit) => edit.address)).toEqual([
      { kind: "page_section", key: "home:what-we-do", field: "heading" },
      { kind: "collection_record", key: "capabilities:creative-design", field: "descriptor" },
    ]);
  });

  it("carries the revision the screen was loaded with, so the store can refuse a lost race", async () => {
    const { repository, save } = subject();

    await save.execute(target, [{ valueId: "heading", value: "New", version: 2 }]);

    expect(repository.written[0]?.[0]?.expectedVersion).toBe(2);
    // And the string the editor was looking at, for a store with no revisions to compare.
    expect(repository.written[0]?.[0]?.baseValue).toBe("What we do");
  });

  it("saves nothing at all when one field is invalid, and names the field", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [
      { valueId: "heading", value: "A perfectly good heading", version: 2 },
      { recordId: "creative-design", valueId: "cta-link", value: "not a url", version: 4 },
    ]);

    expect(result).toMatchObject({ ok: false, valueId: "cta-link" });
    expect(repository.written).toEqual([]);
  });

  it("refuses a field that is read-only, and gives the reason as the message", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [{ valueId: "locked", value: "02" }]);

    expect(result).toMatchObject({
      ok: false,
      valueId: "locked",
      message: "Generated from the piece's position in the list.",
    });
    expect(repository.written).toEqual([]);
  });

  it("refuses a field that is not on the section, rather than writing somewhere else", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [{ valueId: "invented", value: "x" }]);

    expect(result).toMatchObject({ ok: false, valueId: "invented" });
    expect(repository.written).toEqual([]);
  });

  it("says so when nothing had actually changed", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [
      { valueId: "heading", value: "What we do", version: 2 },
    ]);

    expect(result).toMatchObject({ ok: true, saved: 0 });
    expect(repository.written).toEqual([]);
  });

  it("reports a conflict from the store as its own message rather than throwing", async () => {
    const { repository, save } = subject();
    repository.failWith = new ContentConflictError(
      "\"Heading\" was changed by someone else since this screen was loaded.",
    );

    const result = await save.execute(target, [
      { valueId: "heading", value: "Something", version: 2 },
    ]);

    expect(result).toMatchObject({
      ok: false,
      message: '"Heading" was changed by someone else since this screen was loaded.',
    });
  });
});

describe("publishing a section", () => {
  it("publishes the section and the cards inside it, and reports the routes to regenerate", async () => {
    const repository = new FakeCmsRepository([homepage()]);
    await new SaveCmsSection(repository).execute(target, [
      { valueId: "heading", value: "Changed", version: 2 },
      { recordId: "creative-design", valueId: "descriptor", value: "Also changed" },
    ]);

    const publish = new PublishCmsSection(repository, () => ["/", "/creative-services"]);
    const result = await publish.execute(target);

    expect(result).toMatchObject({ ok: true, published: 2, routes: ["/", "/creative-services"] });
    expect(repository.drafts.size).toBe(0);
  });

  it("regenerates nothing when there was nothing unpublished", async () => {
    const repository = new FakeCmsRepository([homepage()]);

    const result = await new PublishCmsSection(repository, () => ["/"]).execute(target);

    expect(result).toMatchObject({ ok: true, published: 0, routes: [] });
  });

  it("refuses a section the site no longer has", async () => {
    const repository = new FakeCmsRepository([homepage()]);

    const result = await new PublishCmsSection(repository, () => []).execute({
      pageId: "home",
      sectionId: "gone",
    });

    expect(result).toMatchObject({ ok: false });
  });
});

describe("discarding drafts", () => {
  it("clears the section's own drafts and its cards' together", async () => {
    const repository = new FakeCmsRepository([homepage()]);
    await new SaveCmsSection(repository).execute(target, [
      { valueId: "heading", value: "Changed", version: 2 },
      { recordId: "creative-design", valueId: "descriptor", value: "Also changed" },
    ]);

    const result = await new DiscardCmsDrafts(repository).execute(target);

    expect(result).toMatchObject({ ok: true });
    expect(repository.drafts.size).toBe(0);
    expect(repository.discarded[0]).toEqual([
      { kind: "page_section", key: "home:what-we-do" },
      { kind: "collection_record", key: "capabilities:creative-design" },
    ]);
  });
});
