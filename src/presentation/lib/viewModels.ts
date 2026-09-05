// React Server Components can only pass plain objects across the server/client
// boundary — our domain value objects (Url, CtaLabel, MediaRef, Slug) are class
// instances, so every domain entity handed to a "use client" component must be
// flattened to a plain view model first. These mappers are that seam.
//
// CONSTRAINT: this file is a pure mapping layer — field renames and
// `.value`/`.toString()` extraction only. No conditionals, no formatting
// decisions, no truncation, no "if this field is empty show that instead"
// logic. That's real behavior and belongs in a use case, not here. Enforced
// by the `no-restricted-syntax` override for this file in eslint.config.mjs
// (no if/switch/ternary) — if a mapper here seems to need one, the fix is a
// new use case, not an exception to this rule.

import type { Cta } from "../../domain/shared/value-objects/Cta";
import type { AspectRatio, MediaKind, MediaRef } from "../../domain/shared/value-objects/MediaRef";
import type { Differentiator } from "../../domain/marketing/entities/Differentiator";
import type { DifferentiatorBlock } from "../../domain/marketing/entities/DifferentiatorBlock";
import type { WhyFamysysBlock } from "../../domain/marketing/entities/WhyFamysysBlock";
import type { FaqBlock, FaqItem } from "../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../domain/marketing/entities/FooterContent";
import type { HeroBand, HeroContent } from "../../domain/marketing/entities/HeroContent";
import type {
  CustomPartnership,
  EngagementTier,
  WaysToWorkBlock,
} from "../../domain/marketing/entities/EngagementTier";
import type { MegaMenuColumn } from "../../domain/navigation/entities/MegaMenuColumn";
import type {
  NavEntry,
  NavPanel,
  NavPanelFeature,
} from "../../domain/navigation/entities/NavPanel";
import type { NavigationMenu } from "../../domain/navigation/entities/NavigationMenu";
import type {
  CustomPartnershipDetail,
  EngagementTierDetail,
} from "../../domain/engagement/entities/EngagementTierDetail";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type {
  CaseStudyDetail,
  WorkCapabilityRef,
} from "../../domain/portfolio/entities/CaseStudyDetail";
import type {
  AboutHero,
  ApproachBlock,
  ApproachClaim,
  DirectionBlock,
  EcosystemBlock,
} from "../../domain/about/entities/AboutPage";
import type { ProcessStepDetail } from "../../domain/process/entities/ProcessStepDetail";
import type { CapabilityDetail } from "../../domain/services/entities/CapabilityDetail";
import type { ServicesHero } from "../../domain/services/entities/CreativeServicesPage";

export interface CtaView {
  readonly label: string;
  readonly href: string;
  readonly isExternal: boolean;
}

export interface MediaView {
  readonly kind: MediaKind;
  readonly src: string;
  readonly poster: string | undefined;
  readonly alt: string;
  readonly aspectRatio: AspectRatio;
}

export interface MegaMenuLinkView extends CtaView {
  readonly description: string;
}

export interface MegaMenuColumnView {
  readonly title: string;
  readonly items: ReadonlyArray<MegaMenuLinkView>;
}

export interface NavPanelFeatureView extends CtaView {
  readonly media: MediaView;
  readonly description: string;
}

export interface NavPanelView {
  readonly columns: ReadonlyArray<MegaMenuColumnView>;
  readonly features: ReadonlyArray<NavPanelFeatureView>;
  // Flat optional fields rather than a nested CtaView, so the mapper can reach them with
  // plain optional chaining (same precedent as `media.poster?.value`) and stay free of
  // the branching this file forbids. Only the three items with panels carry a footer.
  readonly footerLabel: string | undefined;
  readonly footerHref: string | undefined;
}

export interface NavEntryView extends CtaView {
  readonly panel: NavPanelView;
}

export interface NavigationMenuView {
  readonly primaryLinks: ReadonlyArray<NavEntryView>;
  readonly signIn: CtaView;
  readonly primaryCta: CtaView;
}

export interface HeroBandView {
  readonly label: string;
  readonly media: MediaView;
}

export interface HeroContentView {
  readonly heading: string;
  readonly body: string;
  readonly primaryCta: CtaView;
  readonly secondaryCta: CtaView;
  readonly supportingLine: string;
  readonly bands: ReadonlyArray<HeroBandView>;
}

export interface CaseStudyView {
  readonly slug: string;
  readonly reference: string;
  readonly title: string;
  readonly description: string;
  readonly media: MediaView;
}

export interface WorkCapabilityRefView {
  readonly title: string;
  readonly href: string;
}

export interface CaseStudyDetailView extends CaseStudyView {
  readonly demonstrates: string;
  readonly whyThisPiece: string;
  readonly capabilities: ReadonlyArray<WorkCapabilityRefView>;
}

export interface DifferentiatorView {
  readonly title: string;
  readonly description: string;
  readonly media: MediaView;
}

export interface DifferentiatorBlockView {
  readonly heading: string;
  readonly body: string;
  readonly leadIn: string;
  readonly elements: ReadonlyArray<DifferentiatorView>;
  readonly closingStatement: string;
}

export interface ValuePillarView {
  readonly title: string;
  readonly description: string;
  readonly media: MediaView;
}

export interface WhyFamysysBlockView {
  readonly heading: string;
  readonly body: string;
  readonly reasons: ReadonlyArray<ValuePillarView>;
}

export interface EngagementTierView {
  readonly name: string;
  readonly descriptor: string;
  readonly summary: string;
  readonly idealFor: string;
  readonly typicalWork: string;
  readonly cta: CtaView;
}

export interface CustomPartnershipView {
  readonly name: string;
  readonly descriptor: string;
  readonly summary: string;
  readonly invitation: string;
  readonly cta: CtaView;
}

export interface WaysToWorkBlockView {
  readonly heading: string;
  readonly body: string;
  readonly tiers: ReadonlyArray<EngagementTierView>;
  readonly custom: CustomPartnershipView;
}

export interface FaqItemView {
  readonly question: string;
  readonly answer: string;
  // Flat optional fields rather than a nested CtaView, so the mapper can use
  // plain optional chaining (same precedent as `media.poster?.value`) and stay
  // free of the branching this file forbids. Only one answer carries a CTA.
  readonly ctaLabel: string | undefined;
  readonly ctaHref: string | undefined;
  readonly ctaIsExternal: boolean | undefined;
}

export interface FaqBlockView {
  readonly items: ReadonlyArray<FaqItemView>;
}

export interface CapabilityDetailView {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly expandedCopy: string;
  readonly deliverables: ReadonlyArray<string>;
  readonly media: MediaView;
  readonly cta: CtaView;
}

export interface EngagementTierDetailView {
  readonly slug: string;
  readonly name: string;
  readonly descriptor: string;
  readonly summary: string;
  readonly expandedCopy: string;
  readonly idealFor: string;
  readonly typicalWork: string;
  readonly idealForItems: ReadonlyArray<string>;
  readonly typicalWorkItems: ReadonlyArray<string>;
  readonly bestWhen: string;
  readonly engagementShape: string;
  readonly media: MediaView;
  readonly cta: CtaView;
}

export interface CustomPartnershipDetailView {
  readonly slug: string;
  readonly name: string;
  readonly descriptor: string;
  readonly summary: string;
  readonly invitation: string;
  readonly expandedCopy: string;
  readonly coversLabel: string;
  readonly covers: ReadonlyArray<string>;
  readonly media: MediaView;
  readonly cta: CtaView;
}

export interface ProcessStepDetailView {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly expandedCopy: string;
  readonly whatWeNeed: ReadonlyArray<string>;
  readonly whatYouGet: ReadonlyArray<string>;
  readonly media: MediaView;
}

export interface ServicesHeroView {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly cta: CtaView;
  readonly media: MediaView;
}

/* /about. Only the four blocks carrying a MediaRef or a Cta need a view — the inputs and
   build-order blocks are plain strings all the way down and cross the boundary as they
   are. */
export interface AboutHeroView {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly media: MediaView;
}

export interface ApproachClaimView {
  readonly title: string;
  readonly claim: string;
  readonly practice: string;
  readonly media: MediaView;
}

export interface ApproachBlockView {
  readonly eyebrow: string;
  readonly heading: string;
  readonly intro: string;
  readonly practiceLabel: string;
  readonly claims: ReadonlyArray<ApproachClaimView>;
}

export interface EcosystemBlockView {
  readonly eyebrow: string;
  readonly heading: string;
  readonly paragraphs: ReadonlyArray<string>;
  readonly media: MediaView;
  readonly link: CtaView;
}

export interface DirectionBlockView {
  readonly eyebrow: string;
  readonly heading: string;
  readonly ambitionLabel: string;
  readonly ambition: string;
  readonly presentLabel: string;
  readonly present: string;
  readonly media: MediaView;
}

export interface FooterContentView {
  readonly tagline: string;
  readonly contactEmail: string;
  readonly legalLinks: ReadonlyArray<CtaView>;
  readonly socialLinks: ReadonlyArray<CtaView>;
}

export function toCtaView(cta: Cta): CtaView {
  return { label: cta.label.value, href: cta.href.value, isExternal: cta.href.isExternal };
}

export function toMediaView(media: MediaRef): MediaView {
  return {
    kind: media.kind,
    src: media.src.value,
    poster: media.poster?.value,
    alt: media.alt,
    aspectRatio: media.aspectRatio,
  };
}

function toMegaMenuColumnView(column: MegaMenuColumn): MegaMenuColumnView {
  return {
    title: column.title,
    items: column.items.map((item) => ({ ...toCtaView(item), description: item.description })),
  };
}

function toNavPanelFeatureView(feature: NavPanelFeature): NavPanelFeatureView {
  return {
    ...toCtaView(feature),
    media: toMediaView(feature.media),
    description: feature.description,
  };
}

function toNavPanelView(panel: NavPanel): NavPanelView {
  return {
    columns: panel.columns.map(toMegaMenuColumnView),
    features: panel.features.map(toNavPanelFeatureView),
    footerLabel: panel.footerLink?.label.value,
    footerHref: panel.footerLink?.href.value,
  };
}

function toNavEntryView(entry: NavEntry): NavEntryView {
  return { ...toCtaView(entry.link), panel: toNavPanelView(entry.panel) };
}

export function toNavigationMenuView(navigation: NavigationMenu): NavigationMenuView {
  return {
    primaryLinks: navigation.primaryLinks.map(toNavEntryView),
    signIn: toCtaView(navigation.signIn),
    primaryCta: toCtaView(navigation.primaryCta),
  };
}

function toHeroBandView(band: HeroBand): HeroBandView {
  return { label: band.label, media: toMediaView(band.media) };
}

export function toHeroContentView(hero: HeroContent): HeroContentView {
  return {
    heading: hero.heading,
    body: hero.body,
    primaryCta: toCtaView(hero.primaryCta),
    secondaryCta: toCtaView(hero.secondaryCta),
    supportingLine: hero.supportingLine,
    bands: hero.bands.map(toHeroBandView),
  };
}

export function toCaseStudyView(caseStudy: CaseStudy): CaseStudyView {
  return {
    slug: caseStudy.slug.value,
    reference: caseStudy.reference,
    title: caseStudy.title,
    description: caseStudy.description,
    media: toMediaView(caseStudy.media),
  };
}

function toWorkCapabilityRefView(reference: WorkCapabilityRef): WorkCapabilityRefView {
  return { title: reference.title, href: reference.href };
}

export function toCaseStudyDetailView(detail: CaseStudyDetail): CaseStudyDetailView {
  return {
    ...toCaseStudyView(detail),
    demonstrates: detail.demonstrates,
    whyThisPiece: detail.whyThisPiece,
    capabilities: detail.capabilities.map(toWorkCapabilityRefView),
  };
}

function toDifferentiatorView(element: Differentiator): DifferentiatorView {
  return {
    title: element.title,
    description: element.description,
    media: toMediaView(element.media),
  };
}

export function toDifferentiatorBlockView(block: DifferentiatorBlock): DifferentiatorBlockView {
  return {
    heading: block.heading,
    body: block.body,
    leadIn: block.leadIn,
    elements: block.elements.map(toDifferentiatorView),
    closingStatement: block.closingStatement,
  };
}

export function toWhyFamysysBlockView(block: WhyFamysysBlock): WhyFamysysBlockView {
  return {
    heading: block.heading,
    body: block.body,
    reasons: block.reasons.map((reason) => ({
      title: reason.title,
      description: reason.description,
      media: toMediaView(reason.media),
    })),
  };
}

function toEngagementTierView(tier: EngagementTier): EngagementTierView {
  return {
    name: tier.name,
    descriptor: tier.descriptor,
    summary: tier.summary,
    idealFor: tier.idealFor,
    typicalWork: tier.typicalWork,
    cta: toCtaView(tier.cta),
  };
}

function toCustomPartnershipView(custom: CustomPartnership): CustomPartnershipView {
  return {
    name: custom.name,
    descriptor: custom.descriptor,
    summary: custom.summary,
    invitation: custom.invitation,
    cta: toCtaView(custom.cta),
  };
}

export function toWaysToWorkBlockView(block: WaysToWorkBlock): WaysToWorkBlockView {
  return {
    heading: block.heading,
    body: block.body,
    tiers: block.tiers.map(toEngagementTierView),
    custom: toCustomPartnershipView(block.custom),
  };
}

function toFaqItemView(item: FaqItem): FaqItemView {
  return {
    question: item.question,
    answer: item.answer,
    ctaLabel: item.cta?.label.value,
    ctaHref: item.cta?.href.value,
    ctaIsExternal: item.cta?.href.isExternal,
  };
}

export function toFaqBlockView(faq: FaqBlock): FaqBlockView {
  return { items: faq.items.map(toFaqItemView) };
}

export function toCapabilityDetailView(detail: CapabilityDetail): CapabilityDetailView {
  return {
    slug: detail.slug.value,
    title: detail.title,
    description: detail.description,
    expandedCopy: detail.expandedCopy,
    deliverables: detail.deliverables,
    media: toMediaView(detail.media),
    cta: toCtaView(detail.cta),
  };
}

export function toEngagementTierDetailView(tier: EngagementTierDetail): EngagementTierDetailView {
  return {
    slug: tier.slug.value,
    name: tier.name,
    descriptor: tier.descriptor,
    summary: tier.summary,
    expandedCopy: tier.expandedCopy,
    idealFor: tier.idealFor,
    typicalWork: tier.typicalWork,
    idealForItems: tier.idealForItems,
    typicalWorkItems: tier.typicalWorkItems,
    bestWhen: tier.bestWhen,
    engagementShape: tier.engagementShape,
    media: toMediaView(tier.media),
    cta: toCtaView(tier.cta),
  };
}

export function toCustomPartnershipDetailView(
  custom: CustomPartnershipDetail,
): CustomPartnershipDetailView {
  return {
    slug: custom.slug.value,
    name: custom.name,
    descriptor: custom.descriptor,
    summary: custom.summary,
    invitation: custom.invitation,
    expandedCopy: custom.expandedCopy,
    coversLabel: custom.coversLabel,
    covers: custom.covers,
    media: toMediaView(custom.media),
    cta: toCtaView(custom.cta),
  };
}

export function toProcessStepDetailView(detail: ProcessStepDetail): ProcessStepDetailView {
  return {
    slug: detail.slug.value,
    title: detail.title,
    description: detail.description,
    expandedCopy: detail.expandedCopy,
    whatWeNeed: detail.whatWeNeed,
    whatYouGet: detail.whatYouGet,
    media: toMediaView(detail.media),
  };
}

export function toServicesHeroView(hero: ServicesHero): ServicesHeroView {
  return {
    eyebrow: hero.eyebrow,
    heading: hero.heading,
    body: hero.body,
    cta: toCtaView(hero.cta),
    media: toMediaView(hero.media),
  };
}

export function toFooterContentView(footer: FooterContent): FooterContentView {
  return {
    tagline: footer.tagline,
    contactEmail: footer.contactEmail,
    legalLinks: footer.legalLinks.map(toCtaView),
    socialLinks: footer.socialLinks.map(toCtaView),
  };
}

function toApproachClaimView(claim: ApproachClaim): ApproachClaimView {
  return {
    title: claim.title,
    claim: claim.claim,
    practice: claim.practice,
    media: toMediaView(claim.media),
  };
}

export function toAboutHeroView(hero: AboutHero): AboutHeroView {
  return {
    eyebrow: hero.eyebrow,
    heading: hero.heading,
    body: hero.body,
    media: toMediaView(hero.media),
  };
}

export function toApproachBlockView(approach: ApproachBlock): ApproachBlockView {
  return {
    eyebrow: approach.eyebrow,
    heading: approach.heading,
    intro: approach.intro,
    practiceLabel: approach.practiceLabel,
    claims: approach.claims.map(toApproachClaimView),
  };
}

export function toEcosystemBlockView(ecosystem: EcosystemBlock): EcosystemBlockView {
  return {
    eyebrow: ecosystem.eyebrow,
    heading: ecosystem.heading,
    paragraphs: ecosystem.paragraphs,
    media: toMediaView(ecosystem.media),
    link: toCtaView(ecosystem.link),
  };
}

export function toDirectionBlockView(direction: DirectionBlock): DirectionBlockView {
  return {
    eyebrow: direction.eyebrow,
    heading: direction.heading,
    ambitionLabel: direction.ambitionLabel,
    ambition: direction.ambition,
    presentLabel: direction.presentLabel,
    present: direction.present,
    media: toMediaView(direction.media),
  };
}
