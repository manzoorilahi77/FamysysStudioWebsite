import { describe, expect, it } from "vitest";
import type { CmsCollection } from "../../domain/cms/entities/CmsCollection";
import type { CmsRecord } from "../../domain/cms/entities/CmsRecord";
import { FakeCmsRepository, fakeValue } from "./__fakes__/FakeCmsRepository";
import { SaveCmsRecord } from "./SaveCmsRecord";

const record: CmsRecord = {
  id: "launch",
  title: "Launch",
  summary: "Essential Content",
  status: "draft",
  updatedAt: new Date("2026-09-01T00:00:00Z"),
  values: [
    fakeValue({ id: "heading", label: "Heading", value: "A heading" }),
    fakeValue({ id: "cta-label", label: "CTA label", value: "Talk to us", kind: "ctaLabel" }),
    fakeValue({ id: "cta-link", label: "CTA link", value: "/contact", kind: "url" }),
    {
      id: "reference",
      label: "Reference",
      value: "01",
      kind: "text",
      approval: "drafted",
      usedElsewhere: [],
      readOnlyReason: "Generated from the piece's position in the list.",
    },
  ],
  lists: [],
  media: {
    path: "/media/tier-launch.jpg",
    alt: fakeValue({
      id: "media-alt",
      label: "Alt text",
      value: "A studio light.",
      kind: "mediaAlt",
    }),
  },
};

const collection: CmsCollection = {
  id: "engagement-tiers",
  label: "Engagement Tiers",
  description: "",
  panelLabel: "All engagements",
  source: "marketing.content.ts",
  emptyMessage: "None.",
  records: [record],
};

const target = { kind: "record", collectionId: "engagement-tiers", recordId: "launch" } as const;

function subject() {
  const repository = new FakeCmsRepository([], [collection]);
  return { repository, save: new SaveCmsRecord(repository) };
}

describe("SaveCmsRecord", () => {
  it("writes a changed field through its pointer", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [{ valueId: "heading", value: "A new heading" }]);

    expect(result).toEqual({ ok: true, written: 1 });
    // Both addresses, because there are two stores: the source pointer for the file
    // writer, and the record address for the database. Neither came from the caller —
    // the pointer is the read model's and the address is derived from the target.
    expect(repository.written).toEqual([
      [
        {
          pointer: record.values[0]?.pointer,
          owner: {
            kind: "collection_record",
            key: "engagement-tiers:launch",
            field: "heading",
          },
          value: "A new heading",
        },
      ],
    ]);
  });

  it("carries the loaded revision so a stale screen cannot overwrite a newer save", async () => {
    const repository = new FakeCmsRepository(
      [],
      [
        {
          ...collection,
          records: [
            {
              ...record,
              values: record.values.map((value) =>
                value.id === "heading" ? { ...value, version: 7 } : value,
              ),
            },
          ],
        },
      ],
    );

    await new SaveCmsRecord(repository).execute(target, [
      { valueId: "heading", value: "A new heading" },
    ]);

    expect(repository.written[0]?.[0]).toMatchObject({ expectedVersion: 7 });
  });

  it("treats an unchanged field as nothing to do", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [{ valueId: "heading", value: "A heading" }]);

    expect(result).toEqual({ ok: true, written: 0 });
    expect(repository.written).toEqual([]);
  });

  it("refuses a read-only field, and says why it is read-only", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [{ valueId: "reference", value: "99" }]);

    expect(result).toEqual({
      ok: false,
      valueId: "reference",
      message: "Generated from the piece's position in the list.",
    });
    expect(repository.written).toEqual([]);
  });

  it("refuses a field that is not on the record", async () => {
    const { save } = subject();

    const result = await save.execute(target, [{ valueId: "invented", value: "x" }]);

    expect(result).toMatchObject({ ok: false, valueId: "invented" });
  });

  // The rule that matters most: a rejected field must not leave the good ones written.
  it("writes nothing when any field in the batch is invalid", async () => {
    const { repository, save } = subject();

    const result = await save.execute(target, [
      { valueId: "heading", value: "Would have been fine" },
      { valueId: "cta-link", value: "not a url" },
    ]);

    expect(result).toMatchObject({ ok: false, valueId: "cta-link" });
    expect(repository.written).toEqual([]);
  });

  it("validates a CTA label with the same value object the content file uses", async () => {
    const { save } = subject();

    const result = await save.execute(target, [{ valueId: "cta-label", value: "A".repeat(41) }]);

    expect(result).toMatchObject({ ok: false, valueId: "cta-label" });
    expect(result).toHaveProperty("message", expect.stringContaining("40 characters"));
  });

  it("validates alt text against the media reference it belongs to", async () => {
    const { save } = subject();

    const result = await save.execute(target, [{ valueId: "media-alt", value: "   " }]);

    expect(result).toMatchObject({ ok: false, valueId: "media-alt" });
  });

  it("rejects a line break rather than writing an escape that renders as a space", async () => {
    const { save } = subject();

    const result = await save.execute(target, [
      { valueId: "heading", value: "One line\nAnother line" },
    ]);

    expect(result).toMatchObject({ ok: false, valueId: "heading" });
    expect(result).toHaveProperty("message", expect.stringContaining("Line breaks"));
  });

  it("reports a missing record rather than writing into whatever is there", async () => {
    const { save } = subject();

    const result = await save.execute(
      { kind: "record", collectionId: "engagement-tiers", recordId: "gone" },
      [{ valueId: "heading", value: "x" }],
    );

    expect(result).toMatchObject({ ok: false, valueId: null });
  });

  it("surfaces a writer failure as a message rather than throwing at the route", async () => {
    const { repository, save } = subject();
    repository.failWith = new Error("marketing.content.ts › heroContent[heading]: gone.");

    const result = await save.execute(target, [{ valueId: "heading", value: "New" }]);

    expect(result).toMatchObject({ ok: false, valueId: null });
    expect(result).toHaveProperty("message", expect.stringContaining("heroContent"));
  });
});
