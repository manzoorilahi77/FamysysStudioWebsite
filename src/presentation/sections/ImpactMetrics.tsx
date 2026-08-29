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
        <div className="mx-auto max-w-[40ch] text-center">
          <Eyebrow>{intro.eyebrow}</Eyebrow>
          <h2 className="text-display-l mt-4 font-medium text-ink">{intro.heading}</h2>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 text-center sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Counter key={metric.label} stat={metric} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
