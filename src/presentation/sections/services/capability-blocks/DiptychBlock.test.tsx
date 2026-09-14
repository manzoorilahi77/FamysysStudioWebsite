import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DiptychBlock } from "./DiptychBlock";

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
  slug: "explainer-training-videos",
  title: "Explainer & Training Videos",
  description: "Business explainers, training content, course videos, onboarding and instructional content.",
  expandedCopy: "Video for material people have to understand, not just watch.",
  deliverables: ["Modules with a closing summary", "Screen recordings with callouts", "Captions and transcripts"],
  media: { kind: "image" as const, src: "/media/service-explainer-training.jpg", poster: undefined, alt: "People taking notes in training.", aspectRatio: "4:3" as const },
  cta: { label: "Talk to us about this", href: "/contact", isExternal: false },
};

describe("DiptychBlock", () => {
  it("renders two crops of the capability's image beside the pitch", () => {
    render(<DiptychBlock capability={CAPABILITY} deliverablesLabel="What's included" dark={false} />);

    expect(screen.getByRole("heading", { name: "Explainer & Training Videos" })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: CAPABILITY.media.alt })).toHaveLength(1);
  });
});
