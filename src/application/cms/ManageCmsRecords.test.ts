import { describe, expect, it } from "vitest";
import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import { isOpenCollection, recordNoun } from "../../domain/cms/entities/CmsCollection";
import { FakeCmsRepository, fakeValue } from "./__fakes__/FakeCmsRepository";
import { CreateCmsRecord, DeleteCmsRecord, SetInquiryStatus } from "./ManageCmsRecords";

const collection: CmsCollection = {
  id: "faq",
  label: "FAQ",
  description: "",
  panelLabel: "All questions",
  source: "database",
  emptyMessage: "None.",
  records: [
    {
      id: "do-you-work-with-small-businesses",
      title: "Do you work with small businesses?",
      summary: "Yes.",
      status: "draft",
      updatedAt: new Date("2026-09-01T00:00:00Z"),
      values: [fakeValue({ id: "answer", value: "Yes." })],
      lists: [],
    },
  ],
};

function subject() {
  const repository = new FakeCmsRepository([], [collection]);
  return {
    repository,
    create: new CreateCmsRecord(repository),
    remove: new DeleteCmsRecord(repository),
  };
}

describe("adding a record", () => {
  it("passes the title and the line under it through to the store", async () => {
    const { repository, create } = subject();

    const result = await create.execute("faq", {
      slug: "",
      title: "Can you work to a fixed deadline?",
      summary: "Yes, when the scope is agreed first.",
    });

    expect(result).toMatchObject({ ok: true });
    expect(repository.created).toEqual([
      {
        collectionId: "faq",
        record: {
          // The slug falls back to the title, which is what the store derives the key from.
          slug: "Can you work to a fixed deadline?",
          title: "Can you work to a fixed deadline?",
          summary: "Yes, when the scope is agreed first.",
        },
      },
    ]);
  });

  it("refuses a record with no title, rather than storing one that lists as blank", async () => {
    const { repository, create } = subject();

    const result = await create.execute("faq", { slug: "", title: "   ", summary: "Yes." });

    expect(result).toMatchObject({ ok: false });
    expect(repository.created).toEqual([]);
  });

  it("refuses a record with no summary line", async () => {
    const { create } = subject();

    const result = await create.execute("faq", { slug: "", title: "A question?", summary: " " });

    expect(result).toMatchObject({ ok: false });
  });

  it("refuses a collection that does not exist", async () => {
    const { create } = subject();

    const result = await create.execute("invented", { slug: "", title: "A", summary: "B" });

    expect(result).toMatchObject({ ok: false, message: "That collection does not exist." });
  });

  // The file-backed store cannot grow a record, and says so instead of failing obscurely.
  it("refuses outright when the store cannot hold new records", async () => {
    const { repository, create } = subject();
    repository.supportsRecordChanges = false;

    const result = await create.execute("faq", { slug: "", title: "A", summary: "B" });

    expect(result).toMatchObject({ ok: false });
    expect(result).toHaveProperty("message", expect.stringContaining("CONTENT_SOURCE=database"));
    expect(repository.created).toEqual([]);
  });

  it("reports a store failure as a message rather than throwing at the route", async () => {
    const { repository, create } = subject();
    repository.failWith = new Error('"a-question" already exists in this collection.');

    const result = await create.execute("faq", { slug: "", title: "A question?", summary: "B" });

    expect(result).toMatchObject({ ok: false });
    expect(result).toHaveProperty("message", expect.stringContaining("already exists"));
  });
});

describe("removing a record", () => {
  it("removes one that is there", async () => {
    const { repository, remove } = subject();

    const result = await remove.execute("faq", "do-you-work-with-small-businesses");

    expect(result).toMatchObject({ ok: true });
    expect(repository.deleted).toEqual([
      { collectionId: "faq", recordId: "do-you-work-with-small-businesses" },
    ]);
  });

  // What a double-submitted form does.
  it("refuses one that is already gone rather than reporting a second success", async () => {
    const { repository, remove } = subject();

    const result = await remove.execute("faq", "gone");

    expect(result).toMatchObject({ ok: false });
    expect(repository.deleted).toEqual([]);
  });
});

describe("the enquiry inbox", () => {
  it("passes a status change through", async () => {
    const repository = new FakeCmsRepository();

    await new SetInquiryStatus(repository).execute("12", "archived");

    expect(repository.statuses).toEqual([{ id: "12", status: "archived" }]);
  });
});

describe("which collections are open", () => {
  // The panel offers an Add button from this, and the database's list of tables a record
  // can be inserted into has to agree with it.
  it("names the four that can take a new record and no others", () => {
    expect(isOpenCollection("capabilities")).toBe(true);
    expect(isOpenCollection("process-steps")).toBe(true);
    expect(isOpenCollection("engagement-tiers")).toBe(true);
    expect(isOpenCollection("faq")).toBe(true);

    expect(isOpenCollection("case-studies")).toBe(false);
    expect(isOpenCollection("testimonials")).toBe(false);
    expect(isOpenCollection("lists")).toBe(false);
  });

  it("gives a button label that reads as an instruction", () => {
    expect(recordNoun("faq")).toBe("a question");
    expect(recordNoun("lists")).toBe("a record");
  });
});
