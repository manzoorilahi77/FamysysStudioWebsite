import type { ClosingCtaBlock } from "../../domain/marketing/entities/ClosingCtaBlock";
import { toCtaView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { Container } from "../components/Container";
import { DemoForm } from "../components/DemoForm";
import { RevealHeading } from "../components/RevealHeading";
import { Section } from "../components/Section";

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
    <Section dark statement fade={false} ariaLabel={closingCta.heading}>
      <Container>
        {/* The closing pitch and the form, side by side. The heading is IN the left column
            with the copy it belongs to, not stacked above both — it was centred once and
            then full-width-left, and both versions made the same mistake: a line of type
            spanning the whole container above a two-column block reads as a section
            heading introducing two things, when it is one half of one thing.

            It keeps `h2` — it is still the section's name, and the page outline needs it —
            but it drops to display-m and gives up the heading step. At 40 characters the
            heading step needs a full container width to hold two lines, and that is exactly
            the width this layout does not have to give it.

            Six tracks and six, rather than five and six with a channel between: the copy
            column now carries the heading as well, and five tracks broke it onto four
            lines. The measures on the paragraph and the closing line keep the column from
            running to its full width where it should not. */}
        {/* `items-stretch` (the grid default, where this said `items-start`) plus a column
            flex: the copy column is now exactly as tall as the form panel beside it, and
            the closing line is pushed to its foot with `mt-auto`. Top-aligned, the column
            ended two thirds of the way up a 480px panel and left the section's bottom-left
            quarter empty — the two halves have to start and finish together or the panel
            reads as the only thing in the row. */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col lg:col-span-6">
            {/* 18ch, and measured rather than guessed: at 20ch the two 27-character
                headings ("Bring us something to make.", "Ready to start at step one?")
                still fitted on one line — 417px of measure against ~400px of type. 18ch is
                375px, which breaks those two and holds the 37- and 40-character ones to two
                lines rather than pushing them to three. It is on the heading itself because
                `ch` resolves against the element's own font size. */}
            <RevealHeading
              as="h2"
              className="text-display-m max-w-[16ch] font-semibold text-balance text-canvas"
              accent={accent}
            >
              {closingCta.heading}
            </RevealHeading>
            {/* text-body, matching every section header's supporting line. This paragraph
                does the same job under the closing heading that they do under theirs, and
                at lead size it was the one supporting line on the page still set as a
                co-headline. */}
            <p className="text-body mt-10 text-canvas-80" style={{ maxWidth: "44ch" }}>
              {closingCta.body}
            </p>
            {/* `cta-highlight` spends the page's one use of the bright highlight, on
                hover only. It is scoped to this button rather than to the dark primary
                variant because every route renders exactly one closing CTA and several
                other dark primary buttons — putting it on the variant would have made the
                colour appear three or four times a page, which is the one thing it must
                not do. See the rule in globals.css. */}
            <div className="mt-8">
              <Button
                cta={toCtaView(closingCta.cta)}
                variant="primary"
                dark
                className="cta-highlight"
              />
            </div>
            {/* The column's foot, not a fourth item in a stack: `mt-auto` puts it on the
                panel's bottom edge, and the `pt-12` is the floor under how close it may
                come to the button when the column is short. */}
            <p className="text-small mt-auto max-w-[38ch] pt-12 text-canvas-60">
              {closingCta.closingLine}
            </p>
          </div>

          {/* The form sits on a panel now, where it used to be four inputs floating on the
              section's own ink with nothing marking where it began or ended. Same surface
              /contact's "what happens next" aside uses — canvas-4 over ink with a canvas-16
              edge, 1.111:1, the site's dark card — so the two forms read as one studio's
              rather than as two treatments of the same job. No hover escalation: the panel
              is a ground, not a target. */}
          <div className="rounded-sm border border-canvas-16 bg-canvas-4 p-8 lg:col-span-6 lg:col-start-7 lg:p-10">
            <DemoForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
