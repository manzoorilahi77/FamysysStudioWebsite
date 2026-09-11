import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageLedBlock } from "./ImageLedBlock";

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

const CAPABILITY = {
  slug: "creative-design",
  title: "Creative Design",
  description: "Social creatives, marketing collateral, presentations, brochures, banners and digital assets.",
  expandedCopy: "One consistent system applied across everything a brand publishes.",
  deliverables: ["Social creatives", "Presentation decks", "Editable source files"],
  media: { kind: "image" as const, src: "/media/service-creative-design.jpg", poster: undefined, alt: "Colour swatch books.", aspectRatio: "4:3" as const },
  cta: { label: "Talk to us about this", href: "/contact", isExternal: false },
};

describe("ImageLedBlock", () => {
  it("shows the title, the approved one-line descriptor and the disclosure trigger", () => {
    render(<ImageLedBlock capability={CAPABILITY} deliverablesLabel="What's included" dark={false} />);

    expect(screen.getByRole("heading", { name: "Creative Design" })).toBeInTheDocument();
    expect(screen.getByText(CAPABILITY.description)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /more about this/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Talk to us about this/ })).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
