import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TypeLedBlock } from "./TypeLedBlock";

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
  })) as unknown as typeof IntersectionObserver;

  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as unknown as typeof ResizeObserver;
});

const CAPABILITY = {
  slug: "video-production-editing",
  title: "Video Production & Editing",
  description: "UGC editing, Reels, Shorts, promotional videos, business videos and content repurposing.",
  expandedCopy: "Editing and finishing for footage you already have.",
  deliverables: ["Reels and Shorts", "Repurposed clips", "Colour grading"],
  media: { kind: "image" as const, src: "/media/service-video-production.jpg", poster: undefined, alt: "An interview set.", aspectRatio: "4:3" as const },
  cta: { label: "Talk to us about this", href: "/contact", isExternal: false },
};

describe("TypeLedBlock", () => {
  it.each(["left", "right"] as const)("renders the same content with the chip on the %s", (mediaSide) => {
    render(
      <TypeLedBlock
        capability={CAPABILITY}
        deliverablesLabel="What's included"
        dark={false}
        mediaSide={mediaSide}
      />,
    );

    expect(screen.getByRole("heading", { name: "Video Production & Editing" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: CAPABILITY.media.alt })).toBeInTheDocument();
  });
});
