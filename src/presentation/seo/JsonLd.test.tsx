import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
  it("renders one application/ld+json script containing the exact data", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "Test" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script?.textContent ?? "")).toEqual({ "@type": "Thing", name: "Test" });
  });

  it("escapes a closing script tag inside a string value so the block cannot break out", () => {
    const { container } = render(
      <JsonLd data={{ name: "</script><script>alert(1)</script>" }} />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).not.toContain("</script><script>alert(1)</script>");
  });
});
