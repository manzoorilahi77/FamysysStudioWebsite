"use client";

import type { PublishedCapabilityDeck } from "../../domain/capability-deck/entities/PublishedCapabilityDeck";
import type { SlideEntry } from "./types";
import { PresentationShell } from "./components/PresentationShell";
import CoverSlide from "./slides/CoverSlide";
import WhoWeAreSlide from "./slides/WhoWeAreSlide";
import HowWeWorkSlide from "./slides/HowWeWorkSlide";
import WaysToWorkSlide from "./slides/WaysToWorkSlide";
import ServicesSlide from "./slides/ServicesSlide";
import SelectedWorkSlide from "./slides/SelectedWorkSlide";
import CTASlide from "./slides/CTASlide";

/** Every slide type that exists in code — see domain/capability-deck/entities/DeckSlideCatalog.ts, which this mirrors. */
const SLIDE_COMPONENTS: Readonly<Record<string, { readonly title: string; readonly Component: SlideEntry["Component"] }>> = {
  cover: { title: "Cover", Component: CoverSlide },
  "who-we-are": { title: "Who We Are", Component: WhoWeAreSlide },
  "how-we-work": { title: "How We Work", Component: HowWeWorkSlide },
  services: { title: "Services", Component: ServicesSlide },
  "selected-work": { title: "Selected Work", Component: SelectedWorkSlide },
  "ways-to-work": { title: "Ways to Work", Component: WaysToWorkSlide },
  "lets-talk": { title: "Let's Talk", Component: CTASlide },
};

export function CapabilityDeck({ deck }: { readonly deck: PublishedCapabilityDeck }) {
  const slides: ReadonlyArray<SlideEntry> = deck.enabledSlideKeys
    .map((slideKey) => {
      const entry = SLIDE_COMPONENTS[slideKey];
      return entry ? { id: slideKey, title: entry.title, Component: entry.Component } : undefined;
    })
    .filter((entry): entry is SlideEntry => entry !== undefined);

  return <PresentationShell slides={slides} content={deck.source} />;
}
