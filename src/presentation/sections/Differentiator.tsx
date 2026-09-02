import { motion, spacing } from "../../shared/design/tokens";
import { Container } from "../components/Container";
import { ElementCard } from "../components/ElementCard";
import type { ElementTone } from "../components/ElementCard";
import { Reveal } from "../components/Reveal";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";
import type { DifferentiatorBlockView } from "../lib/viewModels";

interface DifferentiatorProps {
  readonly differentiator: DifferentiatorBlockView;
}

/**
 * accent, card, warm, card — assigned by index rather than by content, because the
 * sequence is rhythm. The four elements are peers and nothing about "Professional
 * Production" makes it the warm one. The two white cards sit between the two coloured
 * ones so neither colour has to hold the row on its own; see ElementCard for the
 * measured contrast of each fill.
 */
const TONE_SEQUENCE: readonly ElementTone[] = ["accent", "card", "warm", "card"];

function toneFor(index: number): ElementTone {
  return TONE_SEQUENCE[index % TONE_SEQUENCE.length] ?? "card";
}

/**
 * The page's one mid-page dark beat. §2 and §4 sit on canvas and key their numerals off
 * the ink ramp, which only works on a light ground; putting the dark section here also
 * breaks up what had become five consecutive canvas sections.
 *
 * The four cards run accent, card, warm, card — one accent moment and one warm one,
 * separated by white. See ElementCard for the measured contrast of each fill and for why
 * the accent panel's soft edge against the ink ground stops mattering once it is not the
 * only coloured panel in the row.
 *
 * `fade={false}` for the locked reason: this section's three accented display words are
 * now set in accent-on-dark, which is derived against full ink at 5.015:1 and measures
 * only 3.79:1 against the fade's start value. A dark section carrying any accent stops
 * fading rather than working the colour around. It is the only `<Section dark>` on the
 * site with accented words — every other accent heading sits on a light surface or in an
 * unfaded hero.
 */
export function Differentiator({ differentiator }: DifferentiatorProps) {
  return (
    <Section dark fade={false} ariaLabel={differentiator.heading}>
      <Container>
        {/* The shared split header, where this used to hand-roll the same two elements with
            its own widths — a `max-w-[60%]` heading over a `max-w-[52ch]` body. The two
            columns do that job now and do it at every breakpoint, and the section stops
            being the one place on the homepage where the header shape is written out again.

            No eyebrow: the brief's header shape is eyebrow-heading-body, but the content
            brief supplies no eyebrow string for this section and `leadIn` is not one — it
            is a sentence ending in a colon that introduces the four cards, and it is set
            as one, above them. Logged in docs/content-todo.md rather than invented here. */}
        <SectionHeader
          split
          dark
          accent={["creativity,"]}
          heading={differentiator.heading}
          body={differentiator.body}
        />

        {/* Four across at desktop, two below lg, one below md — where the hover that
            reveals the descriptor does not exist, so the card opens up permanently
            instead. Left-to-right stagger, matching the row's own direction. */}
        <p className="text-body mt-12 font-medium text-canvas">{differentiator.leadIn}</p>

        <div className="mt-6 grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-4">
          {differentiator.elements.map((element, index) => (
            <Reveal
              key={element.title}
              index={index}
              staggerStepMs={motion.stagger.rowStepMs}
              className="h-full"
            >
              <ElementCard element={element} tone={toneFor(index)} />
            </Reveal>
          ))}
        </div>

        {/* The page's ONE centred moment: the thesis, at display size, standing alone with
            the statement measure of space around it. Everything else on the page — the
            closing CTA heading included, since it went flush left — is left aligned, which
            is what lets this one land. */}
        <div style={{ marginTop: spacing.statement }}>
          <RevealHeading
            as="p"
            className="text-heading mx-auto max-w-[30ch] text-center font-medium text-balance text-canvas"
            accent={["advantage", "identity."]}
          >
            {differentiator.closingStatement}
          </RevealHeading>
        </div>
      </Container>
    </Section>
  );
}
