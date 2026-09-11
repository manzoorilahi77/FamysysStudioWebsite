import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ImageGridBlock } from "./ImageGridBlock";

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
  slug: "product-brand-visuals",
  title: "Product & Brand Visuals",
  description: "Product visuals, lifestyle imagery, promotional assets, campaign visuals and AI-assisted brand content.",
  expandedCopy: "Still imagery for products and brands, without booking a studio for every shot.",
  deliverables: ["Plain and lifestyle backgrounds", "A matched campaign set", "Retouching and format variants"],
  media: { kind: "image" as const, src: "/media/service-product-visuals.jpg", poster: undefined, alt: "A teal shoe on a pink set.", aspectRatio: "4:3" as const },
  cta: { label: "Talk to us about this", href: "/contact", isExternal: false },
};

describe("ImageGridBlock", () => {
  it("renders the grid's two photo cells and the pitch, with the accent cells hidden from assistive tech", () => {
    render(<ImageGridBlock capability={CAPABILITY} deliverablesLabel="What's included" dark={false} />);

    expect(screen.getByRole("heading", { name: "Product & Brand Visuals" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: CAPABILITY.media.alt })).toHaveLength(1);
  });
});
