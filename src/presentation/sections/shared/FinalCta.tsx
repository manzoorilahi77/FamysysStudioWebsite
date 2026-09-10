import type { ClosingCtaBlock } from "../../../domain/marketing/entities/ClosingCtaBlock";
import { toCtaView } from "../../lib/viewModels";
import { Button } from "../../components/Button";
import { Container } from "../../components/Container";
import { DemoForm } from "../../components/DemoForm";
import { RevealHeading } from "../../components/RevealHeading";
import { Section } from "../../components/Section";

interface FinalCtaProps {
  readonly closingCta: ClosingCtaBlock;
  /**
   * Which words take the display accent. It has to travel with the heading: a phrase that
   * is not in the heading simply does not match, so a page with its own closing copy would
   * silently lose the accent if this stayed hard-coded to the homepage's wording.
   */
  readonly accent?: ReadonlyArray<string>;
}

export function FinalCta({ closingCta, accent = ["creative requirement?"] }: FinalCtaProps) {
  return (
    // fade={false}, by the project's own rule: any colour derived against full ink is
    // wrong for the first 900ms of a fading section, and this one carries a form. The
    // error messages are accent-on-dark (5.015:1 on ink, 3.792:1 at the fade's start) and
    // the input borders are canvas-40 (3.231:1 on ink, 2.887:1 at the start, against a
    // 3:1 UI-boundary floor). Both were already true before /contact existed; the
    // measured contrast pass built for that page is what surfaced them. A form is also
    // not a moment for a background transition — /contact's form section does the same.
    // ONE SCREEN, NO SCROLL. This used to take `statement` — the site's most generous
    // padding tier, up to 12rem (192px) top and bottom — which is right for a standalone
    // centred line and wrong for a section that also has to fit a five-field form: on an
    // ordinary laptop viewport the panel ran taller than the screen, so the first field and
    // the closing line could never both be on screen at once. `paddingBlockOverride` gives
    // this call site its own small floor instead of the statement tier, and the section is
    // sized to the viewport below the fixed header and centred within it — `min-h` rather
    // than a fixed height, so a very short brief still leaves the section no taller than the
    // screen, and a viewport too short for even the compact form scrolls exactly as far as
    // the content needs rather than by however much the tier over-allocated.
    <Section
      cmsSection="closing-cta"
      dark
      fade={false}
      ariaLabel={closingCta.heading}
      paddingBlockOverride="clamp(1.5rem, 3vh, 2.5rem)"
      className="flex min-h-[calc(100svh-var(--header-height,5rem))] flex-col justify-center"
    >
      <Container>
        {/* The closing pitch and the form, side by side. The heading is IN the left column
            with the copy it belongs to, not stacked above both — it was centred once and
            then full-width-left, and both versions made the same mistake: a line of type
            spanning the whole container above a two-column block reads as a section
            heading introducing two things, when it is one half of one thing.

            It takes the heading step, like every other section head on the site. It was on
            display-m — a step below — on the argument that at 40 characters the heading step
            needs a full container width to hold two lines. Half a container plus an 18ch
            measure holds them: ~40px at 1440 against ~396px of measure is about 20 characters
            a line, and the closing heading is the section's own name, not a subhead under it.

            Six tracks and six, rather than five and six with a channel between: the copy
            column now carries the heading as well, and five tracks broke it onto four
            lines. The measures on the paragraph and the closing line keep the column from
            running to its full width where it should not. */}
        {/* `items-stretch` (the grid default, where this said `items-start`) plus a column
            flex: the copy column is exactly as tall as the form panel beside it, which is
            what lets the two rules below — centre the pitch, pin the closing line — resolve
            against the panel rather than against the copy's own height. Top-aligned, the
            column ended two thirds of the way up a 480px panel and left the section's
            bottom-left quarter empty. */}
        {/* gap-8/lg:gap-10, down from gap-12/gap-16 — the channel between the two columns
            was tuned for a copy block sized against the OLD, taller panel; against the
            compact one it read as too wide a gap relative to the content either side. */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* `lg:justify-center` centres the WHOLE column — heading through closing line —
              on the form panel's vertical middle, which is what a two-column row of unequal
              content lengths needs: top-aligned, a short column against a taller panel put
              the whole left half in the row's upper third.

              THE CLOSING LINE USED TO PIN TO THE PANEL'S BOTTOM EDGE VIA `absolute
              lg:bottom-0`, one flex item deliberately taken out of the column's own flow so
              it tracked the PANEL's height rather than the copy's. That was the right idea
              against the old, much taller panel; against the compact one (see the padding
              note above) it left a gap between the button and a line now anchored to a
              floor several hundred pixels below it — the line read as disconnected from
              its own column rather than as its closing thought. Simple flow, one rhythm
              step under the button, is what "closing line" actually means here. */}
          <div className="flex flex-col lg:col-span-6 lg:justify-center">
            {/* 18ch, and measured rather than guessed. At the heading step it resolves to
                ~430px at 1440, which holds the four 37- to 40-character headings to two
                lines and leaves the two 27-character ones ("Bring us something to make.",
                "Ready to start at step one?") on one — measured on all six routes at 1440,
                1280 and 1024. It is on the heading itself because `ch` resolves against the
                element's own font size, so the measure tracks the step rather than being a
                fixed pixel width that would have to be retuned with it. */}
            <RevealHeading
              as="h2"
              className="text-heading max-w-[18ch] font-semibold text-balance text-canvas"
              accent={accent}
            >
              {closingCta.heading}
            </RevealHeading>
            {/* text-body, matching every section header's supporting line. This paragraph
                does the same job under the closing heading that they do under theirs, and
                at lead size it was the one supporting line on the page still set as a
                co-headline. */}
            <p className="text-body mt-6 text-canvas-80" style={{ maxWidth: "44ch" }}>
              {closingCta.body}
            </p>
            {/* `cta-highlight` spends the page's one use of the bright highlight, on
                hover only. It is scoped to this button rather than to the dark primary
                variant because every route renders exactly one closing CTA and several
                other dark primary buttons — putting it on the variant would have made the
                colour appear three or four times a page, which is the one thing it must
                not do. See the rule in globals.css. */}
            <div className="mt-6">
              <Button
                cta={toCtaView(closingCta.cta)}
                variant="primary"
                dark
                className="cta-highlight"
              />
            </div>
            {/* The column's fourth and last item, in flow at every width — the same
                mt-8 rhythm the heading, paragraph and button already step through, rather
                than a value tuned to clear a pinned sibling. */}
            <p className="text-small mt-8 max-w-[38ch] text-canvas-60">
              {closingCta.closingLine}
            </p>
          </div>

          {/* The form sits on a panel now, where it used to be four inputs floating on the
              section's own ink with nothing marking where it began or ended. Same surface
              /contact's "what happens next" aside uses — canvas-4 over ink with a canvas-16
              edge, 1.111:1, the site's dark card — so the two forms read as one studio's
              rather than as two treatments of the same job. No hover escalation: the panel
              is a ground, not a target.

              p-6/lg:p-7, down from p-8/p-10 — the panel's own padding, spent against a form
              that is now compact by design (see DemoForm.module.css) rather than against
              one built for generous room. */}
          <div className="rounded-sm border border-canvas-16 bg-canvas-4 p-6 lg:col-span-6 lg:col-start-7 lg:p-7">
            <DemoForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
