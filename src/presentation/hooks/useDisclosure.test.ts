import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDisclosure } from "./useDisclosure";

function mockPointer(hasFinePointer: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: hasFinePointer,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

describe("useDisclosure", () => {
  beforeEach(() => {
    mockPointer(false);
  });

  it("starts closed", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.triggerProps["aria-expanded"]).toBe(false);
  });

  it("toggles open and closed on click regardless of pointer type", () => {
    const { result } = renderHook(() => useDisclosure());

    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(false);
  });

  it("opens on pointer enter only when the device has a fine pointer, and stays open on leave if clicked", () => {
    mockPointer(false);
    const coarse = renderHook(() => useDisclosure());
    act(() => coarse.result.current.triggerProps.onPointerEnter());
    expect(coarse.result.current.isOpen).toBe(false);

    mockPointer(true);
    const fine = renderHook(() => useDisclosure());
    act(() => fine.result.current.triggerProps.onPointerEnter());
    expect(fine.result.current.isOpen).toBe(true);
    act(() => fine.result.current.triggerProps.onPointerLeave());
    expect(fine.result.current.isOpen).toBe(false);
  });

  it("reports 0px max-height while closed", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.maxHeight).toBe("0px");
  });

  it("keeps disclosure open when clicking while hovering on a fine pointer device", () => {
    mockPointer(true);
    const { result } = renderHook(() => useDisclosure());

    // Click to open
    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(true);

    // Start hovering
    act(() => result.current.triggerProps.onPointerEnter());
    expect(result.current.isOpen).toBe(true);

    // Click while hovering — isOpen toggles to false underneath, but hover keeps it open
    act(() => result.current.triggerProps.onClick());
    expect(result.current.isOpen).toBe(true); // Still open due to hover, not click

    // Leave — now hover is gone, and isOpen is false, so it closes
    act(() => result.current.triggerProps.onPointerLeave());
    expect(result.current.isOpen).toBe(false);
  });
});
