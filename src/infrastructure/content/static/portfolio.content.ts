import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import { Slug } from "../../../domain/shared/value-objects/Slug";
import type { CaseStudy } from "../../../domain/portfolio/entities/CaseStudy";
import type { ShowreelClip } from "../../../domain/portfolio/entities/ShowreelClip";

// All client names and outcome claims below are fabricated placeholders — see
// docs/content-todo.md for the full inventory the client must confirm or replace.

export const featuredStories: ReadonlyArray<ShowreelClip> = [
  {
    client: "Marchfield Logistics", // TODO(client): fabricated placeholder — confirm real client or remove
    quote: "Forty deliverables in six weeks, one point of contact the whole way.", // TODO(client): fabricated outcome claim — confirm with real client before publishing
    media: MediaRef.create({
      kind: "video",
      src: "/media/story-01.mp4",
      poster: "/media/story-01-poster.svg",
      alt: "Placeholder story reel for Marchfield Logistics",
      aspectRatio: "16:9",
    }),
  },
  {
    client: "Hearth & Loom", // TODO(client): fabricated placeholder — confirm real client or remove
    quote: "The brief changed twice. The deadline didn't move.", // TODO(client): fabricated outcome claim — confirm with real client before publishing
    media: MediaRef.create({
      kind: "video",
      src: "/media/story-02.mp4",
      poster: "/media/story-02-poster.svg",
      alt: "Placeholder story reel for Hearth & Loom",
      aspectRatio: "16:9",
    }),
  },
];

export const caseStudies: ReadonlyArray<CaseStudy> = [
  {
    slug: Slug.create("series-a-launch-film"),
    client: "Solenne Health", // TODO(client): fabricated placeholder — confirm real client or remove
    title: "A funding announcement in four days, not four weeks", // TODO(client): fabricated outcome claim — confirm timeline with real client
    tags: [{ label: "Brand films" }, { label: "Scriptwriting" }],
    media: MediaRef.create({
      kind: "image",
      src: "/media/case-01.svg",
      alt: "Placeholder case study art for Solenne Health",
      aspectRatio: "4:3",
    }),
  },
  {
    slug: Slug.create("warehouse-safety-series"),
    client: "Marchfield Logistics", // TODO(client): fabricated placeholder — confirm real client or remove
    title: "Forty safety briefings, one visual system", // TODO(client): fabricated outcome claim — confirm scope with real client
    tags: [{ label: "Motion graphics" }, { label: "Localisation" }],
    media: MediaRef.create({
      kind: "image",
      src: "/media/case-02.svg",
      alt: "Placeholder case study art for Marchfield Logistics",
      aspectRatio: "4:3",
    }),
  },
  {
    slug: Slug.create("product-launch-suite"),
    client: "Pallidor Systems", // TODO(client): fabricated placeholder — confirm real client or remove
    title: "One shoot day, eleven deliverables", // TODO(client): fabricated outcome claim — confirm scope with real client
    tags: [{ label: "Product films" }, { label: "Editing" }],
    media: MediaRef.create({
      kind: "image",
      src: "/media/case-03.svg",
      alt: "Placeholder case study art for Pallidor Systems",
      aspectRatio: "4:3",
    }),
  },
  {
    slug: Slug.create("brand-anthem-film"),
    client: "Hearth & Loom", // TODO(client): fabricated placeholder — confirm real client or remove
    title: "A brand film that outlasted the rebrand", // TODO(client): fabricated outcome claim — confirm with real client
    tags: [{ label: "Brand films" }, { label: "Creative direction" }],
    media: MediaRef.create({
      kind: "image",
      src: "/media/case-04.svg",
      alt: "Placeholder case study art for Hearth & Loom",
      aspectRatio: "4:3",
    }),
  },
  {
    slug: Slug.create("founder-interview-series"),
    client: "Underline Financial", // TODO(client): fabricated placeholder — confirm real client or remove
    title: "Eight founders, one interview format, no reshoots", // TODO(client): fabricated outcome claim — confirm with real client
    tags: [{ label: "Testimonial films" }, { label: "Colour grade" }],
    media: MediaRef.create({
      kind: "image",
      src: "/media/case-05.svg",
      alt: "Placeholder case study art for Underline Financial",
      aspectRatio: "4:3",
    }),
  },
  {
    slug: Slug.create("conference-recap-package"),
    client: "Kessler Outdoor", // TODO(client): fabricated placeholder — confirm real client or remove
    title: "Three days of footage, same-day recap cuts", // TODO(client): fabricated outcome claim — confirm turnaround with real client
    tags: [{ label: "Event coverage" }, { label: "Editing" }],
    media: MediaRef.create({
      kind: "image",
      src: "/media/case-06.svg",
      alt: "Placeholder case study art for Kessler Outdoor",
      aspectRatio: "4:3",
    }),
  },
];
