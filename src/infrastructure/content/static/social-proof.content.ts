import { MediaRef } from "../../../domain/shared/value-objects/MediaRef";
import type { ClientLogo } from "../../../domain/social-proof/entities/ClientLogo";
import type { MetricStat } from "../../../domain/social-proof/entities/MetricStat";
import type { Testimonial } from "../../../domain/social-proof/entities/Testimonial";

// Every name below is a fabricated placeholder — see docs/content-todo.md.

const LOGO_NAMES = [
  "Marchfield Logistics", // TODO(client): fabricated placeholder — confirm real client or remove
  "Hearth & Loom", // TODO(client): fabricated placeholder — confirm real client or remove
  "Solenne Health", // TODO(client): fabricated placeholder — confirm real client or remove
  "Pallidor Systems", // TODO(client): fabricated placeholder — confirm real client or remove
  "Underline Financial", // TODO(client): fabricated placeholder — confirm real client or remove
  "Kessler Outdoor", // TODO(client): fabricated placeholder — confirm real client or remove
  "Voss & Tern", // TODO(client): fabricated placeholder — confirm real client or remove
  "Bellcastle Group", // TODO(client): fabricated placeholder — confirm real client or remove
  "Amaranth Retail", // TODO(client): fabricated placeholder — confirm real client or remove
  "Thistlewood Partners", // TODO(client): fabricated placeholder — confirm real client or remove
] as const;

export const clientLogos: ReadonlyArray<ClientLogo> = LOGO_NAMES.map((name, index) => ({
  name,
  logo: MediaRef.create({
    kind: "image",
    src: `/media/logo-${String(index + 1).padStart(2, "0")}.svg`,
    alt: `${name} wordmark placeholder`,
    aspectRatio: "1:1",
  }),
}));

export const impactMetrics: ReadonlyArray<MetricStat> = [
  {
    value: 3,
    suffix: "x", // TODO(client): fabricated figure — confirm with client before publishing
    label: "Faster turnaround than a traditional agency retainer",
  },
  {
    value: 40,
    suffix: "%", // TODO(client): fabricated figure — confirm with client before publishing
    label: "Lower cost per finished minute at volume",
  },
  {
    value: 98,
    suffix: "%", // TODO(client): fabricated figure — confirm with client before publishing
    label: "On-time delivery across active engagements",
  },
  {
    value: 12,
    suffix: undefined, // TODO(client): fabricated figure — confirm with client before publishing
    label: "Days average brief-to-delivery for a 60-second cut",
  },
];

export const testimonials: ReadonlyArray<Testimonial> = [
  // PLACEHOLDER — all nine testimonials below are fabricated. TODO(client): replace with real
  // quotes and written permission before publishing; do not ship these as-is.
  {
    quote:
      "They treated our shot list like a spec document — nothing got reinterpreted on set.",
    name: "Priya Nandakumar",
    role: "Head of Brand",
    company: "Marchfield Logistics",
  },
  {
    quote: "We handed them forty separate briefs over a quarter. Every one came back on the day it was promised.",
    name: "Tomas Reyes",
    role: "VP Marketing",
    company: "Pallidor Systems",
  },
  {
    quote: "The edit matched the brief on the first pass. We spent our review time on the strategy, not the cut.",
    name: "Elin Voss",
    role: "Founder",
    company: "Hearth & Loom",
  },
  {
    quote: "No creative surprises, which is exactly what we wanted from a compliance-heavy launch.",
    name: "Rana Whitfield",
    role: "Communications Director",
    company: "Solenne Health",
  },
  {
    quote: "They asked better questions about our audience than our previous agency did in two years.",
    name: "Marcus Holt",
    role: "CMO",
    company: "Underline Financial",
  },
  {
    quote: "Scaled from one video a month to one a week without the quality dropping on the busy weeks.",
    name: "Josephine Baird",
    role: "Marketing Lead",
    company: "Kessler Outdoor",
  },
  {
    quote: "Our internal team stopped needing a shot-by-shot review. That's the real time savings.",
    name: "Devon Achebe",
    role: "Operations Director",
    company: "Amaranth Retail",
  },
  {
    quote: "They flagged a scripting problem before the shoot, not in the edit bay.",
    name: "Lucia Ferraro",
    role: "Brand Manager",
    company: "Bellcastle Group",
  },
  {
    quote: "Consistent output across three different product lines, three different tones.",
    name: "Callum Reyes",
    role: "Creative Director",
    company: "Thistlewood Partners",
  },
];
