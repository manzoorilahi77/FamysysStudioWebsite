"use client";

import type { JSX } from "react";
import { Section } from "../../components/Section";
import type { CapabilityDetailView } from "../../lib/viewModels";
import { DiptychBlock } from "./capability-blocks/DiptychBlock";
import { FullBleedBlock } from "./capability-blocks/FullBleedBlock";
import { ImageGridBlock } from "./capability-blocks/ImageGridBlock";
import { ImageLedBlock } from "./capability-blocks/ImageLedBlock";
import { TypeLedBlock } from "./capability-blocks/TypeLedBlock";
import type { CapabilityCompositionProps } from "./capability-blocks/types";

interface CapabilityBlockProps {
  readonly capability: CapabilityDetailView;
  readonly index: number;
  readonly deliverablesLabel: string;
}

/**
 * Six capabilities, six shapes. Alternating image side used to be the only variation
 * across the page; each position now has its own composition, chosen by POSITION
 * rather than by content, so the six titles keep their fixed order and the page still
 * reads top to bottom as service one through six rather than as a shuffled deck.
 */
const COMPOSITIONS: ReadonlyArray<(props: CapabilityCompositionProps) => JSX.Element> = [
  (props) => <ImageLedBlock {...props} />,
  (props) => <TypeLedBlock {...props} mediaSide="right" />,
  (props) => <FullBleedBlock {...props} />,
  (props) => <DiptychBlock {...props} />,
  (props) => <TypeLedBlock {...props} mediaSide="left" />,
  (props) => <ImageGridBlock {...props} />,
];

export function CapabilityBlock({ capability, index, deliverablesLabel }: CapabilityBlockProps) {
  const isDark = index % 2 === 1;
  // Non-null: `index % COMPOSITIONS.length` is always in [0, COMPOSITIONS.length), so
  // this index always resolves — the assertion is only needed because
  // `noUncheckedIndexedAccess` cannot see that invariant.
  const Composition = COMPOSITIONS[index % COMPOSITIONS.length]!;

  return (
    <Section
      cmsSection="capabilities"
      id={capability.slug}
      dark={isDark}
      fade={false}
      ariaLabel={capability.title}
      className="scroll-anchor"
    >
      <Composition capability={capability} deliverablesLabel={deliverablesLabel} dark={isDark} />
    </Section>
  );
}
