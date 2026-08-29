import Link from "next/link";
import type { EngagementTierView, WaysToWorkBlockView } from "../lib/viewModels";
import { Container } from "../components/Container";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";

interface WaysToWorkProps {
  readonly waysToWork: WaysToWorkBlockView;
}

interface TierDetailProps {
  readonly label: string;
  readonly value: string;
}

function TierDetail({ label, value }: TierDetailProps) {
  return (
    <div className="mt-5">
      <p className="label text-ink-70">{label}</p>
      <p className="text-small mt-2 text-ink-70">{value}</p>
    </div>
  );
}

function TierCard({ tier }: { readonly tier: EngagementTierView }) {
  return (
    <div className="card-surface flex h-full flex-col p-8">
      <p className="text-display-s font-medium text-ink">{tier.name}</p>
      <p className="text-small mt-1 text-accent">{tier.descriptor}</p>
      <p className="text-body mt-4 text-ink-70">{tier.summary}</p>
      <TierDetail label="Ideal for" value={tier.idealFor} />
      <TierDetail label="Typical work includes" value={tier.typicalWork} />
      <Link href={tier.cta.href} className="text-small mt-auto pt-8 font-medium text-accent">
        {tier.cta.label} &rarr;
      </Link>
    </div>
  );
}

export function WaysToWork({ waysToWork }: WaysToWorkProps) {
  return (
    <Section ariaLabel={waysToWork.heading}>
      <Container>
        <div className="mx-auto max-w-[46ch] text-center">
          <h2 className="text-display-l font-medium text-ink">{waysToWork.heading}</h2>
          <p className="text-lead mt-6 text-ink-70">{waysToWork.body}</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {waysToWork.tiers.map((tier, index) => (
            <Reveal key={tier.name} index={index} staggerStepMs={60}>
              <TierCard tier={tier} />
            </Reveal>
          ))}
        </div>

        {/* The custom partnership sits under the three tiers as a full-width
            card, carrying the accent border at rest to set it apart. */}
        <Reveal index={3} staggerStepMs={60}>
          <div
            className="card-surface mt-6 flex flex-col gap-6 p-8 lg:flex-row lg:items-center lg:justify-between"
            style={{ borderColor: "var(--color-accent)" }}
          >
            <div>
              <p className="text-display-s font-medium text-ink">{waysToWork.custom.name}</p>
              <p className="text-small mt-1 text-accent">{waysToWork.custom.descriptor}</p>
              <p className="text-body mt-4 text-ink-70" style={{ maxWidth: "60ch" }}>
                {waysToWork.custom.summary}
              </p>
              <p className="text-body mt-2 text-ink-70" style={{ maxWidth: "60ch" }}>
                {waysToWork.custom.invitation}
              </p>
            </div>
            <Link
              href={waysToWork.custom.cta.href}
              className="text-small shrink-0 font-medium text-accent"
            >
              {waysToWork.custom.cta.label} &rarr;
            </Link>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
