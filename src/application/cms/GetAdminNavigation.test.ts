import { describe, expect, it } from "vitest";
import type { CmsInquiry } from "../../domain/cms/entities/CmsInquiry";
import { GetAdminNavigation } from "./GetAdminNavigation";
import { FakeCmsRepository, fakePage, fakeRecord, fakeValue } from "./__fakes__/FakeCmsRepository";

/**
 * The sidebar is derived, so the only things worth asserting are the derivations: a page is
 * drafted when one of its sections is, the inbox badge counts what nobody has opened, and
 * neither is written down anywhere.
 */

function inquiry(id: string, status: CmsInquiry["status"]): CmsInquiry {
  return {
    id,
    name: "A Sender",
    email: "someone@example.com",
    companyName: "A Company",
    companySize: "11-50",
    companyWebsite: null,
    contactRole: null,
    projectBrief: null,
    sourceForm: "home",
    status,
    receivedAt: new Date("2026-09-01T10:00:00Z"),
  };
}

const home = fakePage({
  id: "home",
  title: "Home",
  route: "/",
  sections: [
    fakeRecord({ id: "hero", title: "Hero" }),
    {
      ...fakeRecord({
        id: "faq",
        title: "FAQ",
        values: [fakeValue({ id: "heading", value: "Questions", draftValue: "Common questions" })],
      }),
      status: "draft",
    },
  ],
});

const about = fakePage({
  id: "about",
  title: "About",
  route: "/about",
  sections: [fakeRecord({ id: "hero", title: "Hero" })],
});

describe("the admin sidebar", () => {
  it("lists the pages the site has, each with the blocks that page renders", async () => {
    const navigation = await new GetAdminNavigation(new FakeCmsRepository([home, about])).execute();

    expect(navigation.pages.map((page) => page.label)).toEqual(["Home", "About"]);
    expect(navigation.pages[0]?.sections.map((section) => section.href)).toEqual([
      "/admin/pages/home/hero",
      "/admin/pages/home/faq",
    ]);
  });

  it("marks a page as drafted when any block on it has unpublished edits", async () => {
    const navigation = await new GetAdminNavigation(new FakeCmsRepository([home, about])).execute();

    expect(navigation.pages[0]?.status).toBe("draft");
    expect(navigation.pages[0]?.sections.map((section) => section.status)).toEqual([
      "published",
      "draft",
    ]);
    expect(navigation.pages[1]?.status).toBe("published");
    expect(navigation.draftedSections).toBe(1);
  });

  it("counts only the enquiries nobody has opened", async () => {
    const repository = new FakeCmsRepository([home]);
    repository.inquiries = [
      inquiry("1", "new"),
      inquiry("2", "read"),
      inquiry("3", "new"),
      inquiry("4", "archived"),
    ];

    const navigation = await new GetAdminNavigation(repository).execute();

    expect(navigation.inbox).toEqual({ href: "/admin/inbox", unread: 2 });
  });

  // A database that will not answer must not take out every screen in the panel; the inbox
  // screen itself reports the failure with the detail.
  it("still renders the sidebar when the inbox cannot be read", async () => {
    const repository = new FakeCmsRepository([home]);
    repository.failWith = new Error("ECONNREFUSED");
    const failing = Object.assign(repository, {
      getInquiries: () => Promise.reject(new Error("ECONNREFUSED")),
    });

    const navigation = await new GetAdminNavigation(failing).execute();

    expect(navigation.pages).toHaveLength(1);
    expect(navigation.inbox.unread).toBe(0);
  });
});
