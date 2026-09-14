import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CmsInquiry } from "../../../domain/cms/entities/CmsInquiry";
import { InboxScreen } from "./InboxScreen";

/**
 * THE INBOX, WITH ENQUIRIES IN IT.
 *
 * The browser suite cannot do this one. Enquiries live in the `inquiries` table, and the
 * end-to-end run uses `CONTENT_SOURCE=static`, where `getInquiries()` returns nothing and
 * `setInquiryStatus` refuses — so a Playwright test of listing, mark-as-read and archive
 * would be a test of an empty list, passing without asserting anything.
 *
 * The list shows one line per enquiry; the full record is behind a modal opened by clicking
 * the row, which is what most of these tests open before asserting on a field. What is NOT
 * proved is that the endpoint behind Mark read / Archive writes the row; that is one line of
 * the database checklist in docs/deployment.md.
 */

const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, replace: vi.fn() }),
}));

function inquiry(overrides: Partial<CmsInquiry> & Pick<CmsInquiry, "id">): CmsInquiry {
  return {
    name: "Priya Raman",
    email: "priya@example.com",
    companyName: "Northwind",
    companySize: "50–200",
    companyWebsite: null,
    contactRole: null,
    projectBrief: null,
    sourceForm: "home",
    status: "new",
    receivedAt: new Date("2026-09-01T09:30:00.000Z"),
    ...overrides,
  };
}

beforeEach(() => {
  refresh.mockReset();
  window.location.hash = "";
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 200 })),
  );
});

function openRow(name: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(name) }));
  return screen.getByRole("dialog");
}

describe("InboxScreen", () => {
  it("lists enquiries newest first", () => {
    render(
      <InboxScreen
        inquiries={[
          inquiry({ id: "b", name: "Newer", receivedAt: new Date("2026-09-05T09:00:00.000Z") }),
          inquiry({ id: "a", name: "Older", receivedAt: new Date("2026-09-01T09:00:00.000Z") }),
        ]}
      />,
    );

    const rows = screen.getAllByRole("button", { name: /Newer|Older/ });
    expect(rows[0]).toHaveTextContent("Newer");
    expect(rows[1]).toHaveTextContent("Older");
  });

  it("opens the full record, with every field the sender filled in, on click", () => {
    render(
      <InboxScreen
        inquiries={[
          inquiry({
            id: "a",
            sourceForm: "contact",
            companyWebsite: "https://northwind.example",
            contactRole: "Marketing Lead",
            projectBrief: "Six explainer videos before the end of the quarter.",
          }),
        ]}
      />,
    );

    const dialog = openRow("Priya Raman");
    expect(within(dialog).getByText("Northwind")).toBeInTheDocument();
    expect(within(dialog).getByText("50–200")).toBeInTheDocument();
    expect(within(dialog).getByText("https://northwind.example")).toBeInTheDocument();
    expect(within(dialog).getByText("Marketing Lead")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Six explainer videos before the end of the quarter."),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Reply by email" })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:priya@example.com"),
    );
  });

  it("distinguishes a question never asked from one declined", () => {
    render(
      <InboxScreen
        inquiries={[
          inquiry({ id: "a", sourceForm: "contact", companyWebsite: "", contactRole: null }),
        ]}
      />,
    );

    const dialog = openRow("Priya Raman");
    // Asked and left blank: shown, as blank.
    expect(within(dialog).getByText("Website")).toBeInTheDocument();
    expect(within(dialog).getByText("Left blank")).toBeInTheDocument();
    // Never asked: absent altogether, not shown as empty.
    expect(within(dialog).queryByText("Role")).not.toBeInTheDocument();
  });

  it("carries a machine-readable timestamp on the row", () => {
    const { container } = render(<InboxScreen inquiries={[inquiry({ id: "a" })]} />);
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-09-01T09:30:00.000Z");
  });

  it("marks an enquiry as read from the row, inline", async () => {
    render(<InboxScreen inquiries={[inquiry({ id: "abc", status: "new" })]} />);

    const row = screen.getByText("Priya Raman").closest("li") as HTMLElement;
    fireEvent.click(within(row).getByRole("button", { name: "Mark read" }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/admin/api/inquiries",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ id: "abc", status: "read" }),
        }),
      ),
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("archives an enquiry from inside the modal, and offers no Mark read once it is not new", async () => {
    render(<InboxScreen inquiries={[inquiry({ id: "abc", status: "read" })]} />);

    const dialog = openRow("Priya Raman");
    expect(within(dialog).queryByRole("button", { name: "Mark read" })).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Archive" }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/admin/api/inquiries",
        expect.objectContaining({ body: JSON.stringify({ id: "abc", status: "archived" }) }),
      ),
    );
  });

  it("keeps archived enquiries listed, with a way back", async () => {
    render(
      <InboxScreen
        inquiries={[
          inquiry({ id: "open", name: "Open one", status: "new" }),
          inquiry({ id: "gone", name: "Archived one", status: "archived" }),
        ]}
      />,
    );

    const row = screen.getByText("Archived one").closest("li") as HTMLElement;
    expect(within(row).getByText("Archived")).toBeInTheDocument();
    fireEvent.click(within(row).getByRole("button", { name: "Put back in the inbox" }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/admin/api/inquiries",
        expect.objectContaining({ body: JSON.stringify({ id: "gone", status: "read" }) }),
      ),
    );
  });

  it("filters by status", () => {
    render(
      <InboxScreen
        inquiries={[
          inquiry({ id: "a", name: "New one", status: "new" }),
          inquiry({ id: "b", name: "Archived one", status: "archived" }),
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Archived" }));
    expect(screen.queryByText("New one")).not.toBeInTheDocument();
    expect(screen.getByText("Archived one")).toBeInTheDocument();
  });

  it("opens the enquiry named in the URL hash on load", () => {
    window.location.hash = "#inquiry-abc";
    render(<InboxScreen inquiries={[inquiry({ id: "abc" })]} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("says a failure happened rather than looking like it worked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: "There is no inbox." }), { status: 422 }),
      ),
    );
    render(<InboxScreen inquiries={[inquiry({ id: "abc" })]} />);

    const row = screen.getByText("Priya Raman").closest("li") as HTMLElement;
    fireEvent.click(within(row).getByRole("button", { name: "Mark read" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("There is no inbox.");
    expect(refresh).not.toHaveBeenCalled();
  });

  it("states the gap: nothing is emailed anywhere", () => {
    render(<InboxScreen inquiries={[]} />);

    expect(screen.getByText(/Nothing is emailed anywhere/)).toBeInTheDocument();
    expect(screen.getByText(/No submissions yet/)).toBeInTheDocument();
  });

  it("says enquiries are emailed, and stops saying they are not, once mail is on", () => {
    render(<InboxScreen inquiries={[]} isMailEnabled />);

    expect(screen.getByText(/Each enquiry is also emailed/)).toBeInTheDocument();
    expect(screen.queryByText(/Nothing is emailed anywhere/)).not.toBeInTheDocument();
  });

  it("anchors each enquiry at the id the notification email links to", () => {
    const { container } = render(<InboxScreen inquiries={[inquiry({ id: "42" })]} />);

    expect(container.querySelector("#inquiry-42")).not.toBeNull();
  });
});
