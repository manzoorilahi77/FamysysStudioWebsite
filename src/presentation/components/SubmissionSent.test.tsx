import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubmissionSent } from "./SubmissionSent";

const BASE = {
  heading: "Thanks — your brief is with us.",
  body: "We read every one.",
  fullName: "",
  email: "shaf@acme.com",
  isConfirmationEmailed: false,
  onReset: () => undefined,
};

describe("SubmissionSent", () => {
  it("greets the sender by first name when they gave one", () => {
    render(<SubmissionSent {...BASE} fullName="Shafwan Ahmed" />);

    expect(screen.getByText("Thanks, Shafwan.")).toBeInTheDocument();
    expect(screen.queryByText(BASE.heading)).not.toBeInTheDocument();
  });

  it("falls back to the page's own heading without a name", () => {
    render(<SubmissionSent {...BASE} />);

    expect(screen.getByText(BASE.heading)).toBeInTheDocument();
  });

  it("lists the confirmation email only when the server scheduled one", () => {
    const { rerender } = render(<SubmissionSent {...BASE} />);
    expect(screen.queryByText("Confirmation on its way")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    rerender(<SubmissionSent {...BASE} isConfirmationEmailed />);
    expect(screen.getByText("Confirmation on its way")).toBeInTheDocument();
    expect(screen.getByText(/To shaf@acme\.com/)).toBeInTheDocument();
  });

  it("announces itself as a status and offers another enquiry", () => {
    const onReset = vi.fn();
    render(<SubmissionSent {...BASE} onReset={onReset} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Send another enquiry/ }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("promises no response time", () => {
    render(<SubmissionSent {...BASE} isConfirmationEmailed />);

    expect(screen.getByRole("status").textContent).not.toMatch(
      /\b(within|business day|hours?|days?|shortly|soon)\b/i,
    );
  });
});
