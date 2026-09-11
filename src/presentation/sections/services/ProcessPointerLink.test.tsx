import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProcessPointerLink } from "./ProcessPointerLink";

// The Section this component renders through uses useInView (IntersectionObserver) for
// its entry fade, same as CapabilityDisclosure.test.tsx — jsdom does not implement it.
beforeEach(() => {
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });
});

describe("ProcessPointerLink", () => {
  it("renders the heading as a link to how-we-work, and marks itself for the CMS preview", () => {
    render(
      <ProcessPointerLink
        eyebrow="How we work"
        heading="Five steps, on every service."
        cta={{ label: "See how we work", href: "/how-we-work", isExternal: false }}
      />,
    );

    const link = screen.getByRole("link", { name: /Five steps, on every service\./ });
    expect(link).toHaveAttribute("href", "/how-we-work");
    expect(document.querySelector('[data-cms-section="process-pointer"]')).not.toBeNull();
  });
});
