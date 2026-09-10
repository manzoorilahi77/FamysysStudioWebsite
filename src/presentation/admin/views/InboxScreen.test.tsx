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
 * Rendering the screen here against real enquiries and driving the same two controls is
 * what can actually be proved from this machine. What is NOT proved is that the endpoint
 * behind them writes the row; that is one line of the database checklist in
 * docs/deployment.md.
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
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("{}", { status: 200 })),
  );
});

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

    const names = screen.getAllByRole("heading", { level: 2 }).map((node) => node.textContent);
    expect(names[0]).toContain("Newer");
    expect(names[1]).toContain("Older");
  });

  it("shows every field the sender filled in", () => {
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

    expect(screen.getByText("Northwind")).toBeInTheDocument();
    expect(screen.getByText("50–200")).toBeInTheDocument();
    expect(screen.getByText("https://northwind.example")).toBeInTheDocument();
    expect(screen.getByText("Marketing Lead")).toBeInTheDocument();
    expect(
      screen.getByText("Six explainer videos before the end of the quarter."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "priya@example.com" })).toHaveAttribute(
      "href",
      "mailto:priya@example.com",
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

    // Asked and left blank: shown, as blank.
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("Left blank")).toBeInTheDocument();
    // Never asked: absent altogether, not shown as empty.
    expect(screen.queryByText("Role")).not.toBeInTheDocument();
  });

  it("carries a machine-readable timestamp", () => {
    const { container } = render(<InboxScreen inquiries={[inquiry({ id: "a" })]} />);
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-09-01T09:30:00.000Z");
  });

  it("marks an enquiry as read", async () => {
    render(<InboxScreen inquiries={[inquiry({ id: "abc", status: "new" })]} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark read" }));

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

  it("archives an enquiry, and offers no Mark read once it is not new", async () => {
    render(<InboxScreen inquiries={[inquiry({ id: "abc", status: "read" })]} />);

    expect(screen.queryByRole("button", { name: "Mark read" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/admin/api/inquiries",
        expect.objectContaining({ body: JSON.stringify({ id: "abc", status: "archived" }) }),
      ),
    );
  });

  it("keeps archived enquiries in their own panel, with a way back", async () => {
    render(
      <InboxScreen
        inquiries={[
          inquiry({ id: "open", name: "Open one", status: "new" }),
          inquiry({ id: "gone", name: "Archived one", status: "archived" }),
        ]}
      />,
    );

    const archived = screen.getByText("Archived").closest("section");
    expect(archived).not.toBeNull();
    expect(within(archived as HTMLElement).getByText(/Archived one/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Put back in the inbox" }));
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        "/admin/api/inquiries",
        expect.objectContaining({ body: JSON.stringify({ id: "gone", status: "read" }) }),
      ),
    );
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

    fireEvent.click(screen.getByRole("button", { name: "Mark read" }));

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
