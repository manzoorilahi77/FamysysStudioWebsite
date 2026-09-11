import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CapabilityBlock } from "./CapabilityBlock";

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

  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;

  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any;
});

function capabilityAt(index: number) {
  return {
    slug: `capability-${index}`,
    title: `Capability ${index}`,
    description: "A one-line descriptor.",
    expandedCopy: "The expanded paragraph.",
    deliverables: ["First", "Second", "Third"],
    media: { kind: "image" as const, src: "/media/placeholder.jpg", poster: undefined, alt: "Placeholder.", aspectRatio: "4:3" as const },
    cta: { label: "Talk to us about this", href: "/contact", isExternal: false },
  };
}

describe("CapabilityBlock", () => {
  it("renders every one of the six positions without throwing, each as its own section", () => {
    for (let index = 0; index < 6; index += 1) {
      const { unmount } = render(
        <CapabilityBlock capability={capabilityAt(index)} index={index} deliverablesLabel="What's included" />,
      );
      expect(screen.getByRole("heading", { name: `Capability ${index}` })).toBeInTheDocument();
      unmount();
    }
  });

  it("marks its section for the CMS preview and gives it the capability's slug as an anchor", () => {
    render(<CapabilityBlock capability={capabilityAt(0)} index={0} deliverablesLabel="What's included" />);
    const section = document.getElementById("capability-0");
    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("data-cms-section", "capabilities");
  });
});
