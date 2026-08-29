import type { ClosingCtaBlock } from "../entities/ClosingCtaBlock";
import type { Differentiator } from "../entities/Differentiator";
import type { FooterContent } from "../entities/FooterContent";
import type { HeroContent } from "../entities/HeroContent";
import type { ManifestoBlock } from "../entities/ManifestoBlock";
import type { PositioningBlock } from "../entities/PositioningBlock";
import type { ProcessBlock } from "../entities/ProcessBlock";
import type { SectionIntro } from "../entities/SectionIntro";
import type { TalentBlock } from "../entities/TalentBlock";
import type { ValuePillar } from "../entities/ValuePillar";
import type { Cta } from "../../shared/value-objects/Cta";

export interface WorkSection {
  readonly intro: SectionIntro;
  readonly exploreCta: Cta;
}

export interface DifferentiatorsBlock {
  readonly intro: SectionIntro;
  readonly items: ReadonlyArray<Differentiator>;
}

export interface MarketingContentRepository {
  getHero(): Promise<HeroContent>;
  getManifesto(): Promise<ManifestoBlock>;
  getValuePillars(): Promise<ReadonlyArray<ValuePillar>>;
  getPillarsIntro(): Promise<SectionIntro>;
  getMarqueeEyebrow(): Promise<string>;
  getPositioning(): Promise<PositioningBlock>;
  getMetricsIntro(): Promise<SectionIntro>;
  getServicesIntro(): Promise<SectionIntro>;
  getWorkSection(): Promise<WorkSection>;
  getComparisonIntro(): Promise<SectionIntro>;
  getTestimonialsIntro(): Promise<SectionIntro>;
  getProcessBlock(): Promise<ProcessBlock>;
  getDifferentiatorsBlock(): Promise<DifferentiatorsBlock>;
  getTalentBlock(): Promise<TalentBlock>;
  getClosingCta(): Promise<ClosingCtaBlock>;
  getFooterContent(): Promise<FooterContent>;
}
