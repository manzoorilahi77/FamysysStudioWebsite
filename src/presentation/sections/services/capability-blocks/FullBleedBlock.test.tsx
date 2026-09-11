import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FullBleedBlock } from "./FullBleedBlock";

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
  slug: "ai-video-virtual-presenters",
  title: "AI Video & Virtual Presenters",
  description: "AI-generated videos, virtual presenters, AI UGC, visual storytelling and AI-assisted production.",
  expandedCopy: "Video built around a generated presenter instead of a filmed one.",
  deliverables: ["A choice of voice and language", "Multi-language versions", "Same brand treatment as any video"],
  media: { kind: "image" as const, src: "/media/service-ai-video.jpg", poster: undefined, alt: "A presenter to camera.", aspectRatio: "16:9" as const },
  cta: { label: "Talk to us about this", href: "/contact", isExternal: false },
};

describe("FullBleedBlock", () => {
  it("renders the pitch on-dark over the image, regardless of the section's own tone", () => {
    render(<FullBleedBlock capability={CAPABILITY} deliverablesLabel="What's included" dark={false} />);

    const heading = screen.getByRole("heading", { name: "AI Video & Virtual Presenters" });
    expect(heading.className).toContain("text-canvas");
    expect(screen.getByRole("img", { name: CAPABILITY.media.alt })).toBeInTheDocument();
  });
});
