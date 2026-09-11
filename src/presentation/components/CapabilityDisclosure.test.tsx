import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CapabilityDisclosure } from "./CapabilityDisclosure";

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });

  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });
});

const BASE = {
  label: "What's included",
  expandedCopy: "Design work that carries a brand across everything it publishes.",
  deliverables: ["First deliverable", "Second deliverable", "Third deliverable"],
};

describe("CapabilityDisclosure", () => {
  it("hides the expanded copy and deliverables until opened", () => {
    render(<CapabilityDisclosure {...BASE} />);

    expect(screen.getByText(BASE.expandedCopy)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /more about this/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("opens on click and reports the change to the trigger's accessible state", () => {
    render(<CapabilityDisclosure {...BASE} />);

    fireEvent.click(screen.getByRole("button", { name: /more about this/i }));

    expect(screen.getByRole("button", { name: /show less/i })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("is reachable without a mouse — the trigger is a real button", () => {
    render(<CapabilityDisclosure {...BASE} />);
    const trigger = screen.getByRole("button", { name: /more about this/i });
    trigger.focus();
    expect(trigger).toHaveFocus();
  });
});
