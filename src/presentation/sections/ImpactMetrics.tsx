import type { SectionIntro } from "../../domain/marketing/entities/SectionIntro";
import type { MetricStat } from "../../domain/social-proof/entities/MetricStat";
import { Container } from "../components/Container";
import { Counter } from "../components/Counter";
import { Eyebrow } from "../components/Eyebrow";
import { Section } from "../components/Section";

interface ImpactMetricsProps {
  readonly intro: SectionIntro;
  readonly metrics: ReadonlyArray<MetricStat>;
}

export function ImpactMetrics({ intro, metrics }: ImpactMetricsProps) {
  return (
    <Section ariaLabel="Success in numbers">
      <Container>
        <Eyebrow>{intro.eyebrow}</Eyebrow>
        <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>
        <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Counter key={metric.label} stat={metric} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
