import type { CtaView } from "../lib/viewModels";
import { Button } from "../components/Button";
import { Container } from "../components/Container";

interface InlineCtaProps {
  readonly cta: CtaView;
  readonly prompt: string;
}

/** Fidelity-loop pass 1, gap #8 — a compact booking-CTA band repeated after §4.6, §4.10, and
    §4.14, matching how often Superside re-offers its primary CTA down the page. Not a full
    Section (no dark/light surface swap) — it's a thin band that sits inside whichever section
    rhythm it's dropped into. */
export function InlineCta({ cta, prompt }: InlineCtaProps) {
  return (
    <div className="bg-canvas py-10">
      <Container className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-display-s font-medium text-ink">{prompt}</p>
        <Button cta={cta} variant="primary" />
      </Container>
    </div>
  );
}
