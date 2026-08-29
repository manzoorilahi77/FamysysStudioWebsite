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
import type { FaqBlock, FaqItem } from "../../domain/marketing/entities/FaqBlock";
import type { FooterContent } from "../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type {
  CustomPartnership,
  EngagementTier,
  WaysToWorkBlock,
} from "../../domain/marketing/entities/EngagementTier";
import type { MegaMenuColumn } from "../../domain/navigation/entities/MegaMenuColumn";
import type { NavigationMenu } from "../../domain/navigation/entities/NavigationMenu";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";

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

export interface NavigationMenuView {
  readonly primaryLinks: ReadonlyArray<CtaView>;
  readonly megaMenu: ReadonlyArray<MegaMenuColumnView>;
  readonly signIn: CtaView;
  readonly primaryCta: CtaView;
}

export interface HeroContentView {
  readonly heading: string;
  readonly body: string;
  readonly primaryCta: CtaView;
  readonly secondaryCta: CtaView;
  readonly supportingLine: string;
  readonly mosaicTiles: ReadonlyArray<MediaView>;
}

export interface CaseStudyView {
  readonly slug: string;
  readonly reference: string;
  readonly title: string;
  readonly description: string;
  readonly media: MediaView;
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

export function toNavigationMenuView(navigation: NavigationMenu): NavigationMenuView {
  return {
    primaryLinks: navigation.primaryLinks.map(toCtaView),
    megaMenu: navigation.megaMenu.map(toMegaMenuColumnView),
    signIn: toCtaView(navigation.signIn),
    primaryCta: toCtaView(navigation.primaryCta),
  };
}

export function toHeroContentView(hero: HeroContent): HeroContentView {
  return {
    heading: hero.heading,
    body: hero.body,
    primaryCta: toCtaView(hero.primaryCta),
    secondaryCta: toCtaView(hero.secondaryCta),
    supportingLine: hero.supportingLine,
    mosaicTiles: hero.mosaicTiles.map(toMediaView),
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

export function toFooterContentView(footer: FooterContent): FooterContentView {
  return {
    tagline: footer.tagline,
    contactEmail: footer.contactEmail,
    legalLinks: footer.legalLinks.map(toCtaView),
    socialLinks: footer.socialLinks.map(toCtaView),
  };
}
