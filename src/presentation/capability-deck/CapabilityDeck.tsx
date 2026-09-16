"use client";

/**
 * His src/App.jsx, unchanged in substance: the same six slides in the same
 * order, with How We Work left commented out exactly where he left it.
 *
 * THE ONE CLIENT DIRECTIVE FOR THE WHOLE DECK. Everything under it — the shell,
 * the slides, the galleries, the hooks — is a client module by virtue of being
 * imported from here, so no other file in the port needs the directive. The deck
 * is entirely interactive (keyboard, wheel, swipe, fullscreen, AnimatePresence),
 * so there is nothing here that would benefit from rendering on the server.
 */

import type { SlideEntry } from "./types";
import { PresentationShell } from "./components/PresentationShell";
import CoverSlide from "./slides/CoverSlide";
import WhoWeAreSlide from "./slides/WhoWeAreSlide";
// How We Work is temporarily disabled — re-add its entry below (between
// Who We Are and Services, its original position) to bring it back.
// import HowWeWorkSlide from './slides/HowWeWorkSlide'
import WaysToWorkSlide from "./slides/WaysToWorkSlide";
import ServicesSlide from "./slides/ServicesSlide";
import SelectedWorkSlide from "./slides/SelectedWorkSlide";
import CTASlide from "./slides/CTASlide";

const slides: ReadonlyArray<SlideEntry> = [
  { id: "cover", title: "Cover", Component: CoverSlide },
  { id: "who-we-are", title: "Who We Are", Component: WhoWeAreSlide },
  // { id: 'how-we-work', title: 'How We Work', Component: HowWeWorkSlide },
  { id: "services", title: "Services", Component: ServicesSlide },
  { id: "selected-work", title: "Selected Work", Component: SelectedWorkSlide },
  { id: "ways-to-work", title: "Ways to Work", Component: WaysToWorkSlide },
  { id: "lets-talk", title: "Let's Talk", Component: CTASlide },
];

export function CapabilityDeck() {
  return <PresentationShell slides={slides} />;
}
