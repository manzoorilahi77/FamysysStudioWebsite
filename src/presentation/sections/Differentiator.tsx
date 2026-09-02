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
 * Cards 1 and 3 take the canvas panel, 2 and 4 the accent one. Alternating by index rather
 * than by content, because the alternation is rhythm — the four elements are peers and
 * nothing about "Professional Production" makes it the canvas one.
 */
function toneFor(index: number): ElementTone {
  return index % 2 === 0 ? "canvas" : "accent";
}

/**
 * The page's one mid-page dark beat. §2 and §4 sit on canvas and key their numerals off
 * the ink ramp, which only works on a light ground; putting the dark section here also
 * breaks up what had become five consecutive canvas sections.
 *
 * NOTE on the accent panel: canvas separates from the ink ground at 12.553:1, but accent
 * manages only 2.458:1 against it — the two are close in luminance even though they read
 * as different colours. The cards are never ambiguous, because each is anchored by a
 * photograph that separates fully and the panel text itself is 5.107:1, but the accent
 * panel's own *edge* against the section is soft. If that reads as weak in review, the fix
 * is `accent-on-dark` (#7995F5) with ink text, which measures 5.015:1 both for the panel
 * against the ground and for the text on the panel — strictly better on both axes, at the
 * cost of a lighter, less saturated blue.
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
