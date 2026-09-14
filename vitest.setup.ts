import "@testing-library/jest-dom/vitest";

// jsdom does not implement matchMedia. `useReducedMotion` (and anything built on it — the
// entrance transitions on PendingDialog, InquiryDetailDialog, RevealHeading) reads it on
// every render, so any test that mounts one of those components needs this stub, not just
// tests that care about the reduced-motion behaviour itself. Answers "no preference" by
// default, which is the common case and what a real browser defaults to.
// jsdom does not implement the native <dialog> element's modal behaviour — `showModal`/
// `close` are absent from its prototype entirely in this project's jsdom version, so any
// test that mounts a component built on <dialog> (InquiryDetailDialog, and PendingDialog/
// WorkDetailDialog if they are ever unit-tested) needs this polyfill first. It only tracks
// the `open` attribute; it does not model real focus-trapping or inertness, which is exactly
// why those are also covered by the Playwright suite.
if (typeof HTMLDialogElement !== "undefined" && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement): void {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement): void {
    this.removeAttribute("open");
  };
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
