// React Server Components can only pass plain objects across the server/client
// boundary — our domain value objects (Url, CtaLabel, MediaRef,
// ComparisonCriterion, Slug) are class instances, so every domain entity
// handed to a "use client" component must be flattened to a plain view model
// first. These mappers are that seam.
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
import type { ComparisonCriterion } from "../../domain/comparison/entities/ComparisonCriterion";
import type { FooterContent } from "../../domain/marketing/entities/FooterContent";
import type { HeroContent } from "../../domain/marketing/entities/HeroContent";
import type { ManifestoBlock } from "../../domain/marketing/entities/ManifestoBlock";
import type { PositioningBlock } from "../../domain/marketing/entities/PositioningBlock";
import type { TalentBlock } from "../../domain/marketing/entities/TalentBlock";
import type { MegaMenuColumn } from "../../domain/navigation/entities/MegaMenuColumn";
import type { NavigationMenu } from "../../domain/navigation/entities/NavigationMenu";
import type { CaseStudy } from "../../domain/portfolio/entities/CaseStudy";
import type { ShowreelClip } from "../../domain/portfolio/entities/ShowreelClip";
import type { WorkSection } from "../../domain/marketing/repositories/MarketingContentRepository";

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
  readonly eyebrow: string;
  readonly headlineLines: ReadonlyArray<string>;
  readonly subhead: string;
  readonly primaryCta: CtaView;
  readonly secondaryCta: CtaView;
  readonly media: MediaView;
  readonly mosaicTiles: ReadonlyArray<MediaView>;
}

export interface ManifestoBlockView {
  readonly eyebrow: string;
  readonly statementLines: ReadonlyArray<string>;
  readonly supportingParagraph: string;
  readonly cta: CtaView;
}

export interface PositioningBlockView {
  readonly eyebrow: string;
  readonly heading: string;
  readonly supportingParagraph: string;
  readonly media: MediaView;
}

export interface ShowreelClipView {
  readonly client: string;
  readonly quote: string;
  readonly media: MediaView;
}

export interface CaseStudyView {
  readonly slug: string;
  readonly client: string;
  readonly title: string;
  readonly tags: ReadonlyArray<string>;
  readonly media: MediaView;
}

export interface ComparisonCriterionView {
  readonly label: string;
  readonly valuesByColumn: ReadonlyArray<string>;
}

export interface FooterContentView {
  readonly tagline: string;
  readonly contactEmail: string;
  readonly legalLinks: ReadonlyArray<CtaView>;
  readonly socialLinks: ReadonlyArray<CtaView>;
}

export interface TalentBlockView {
  readonly eyebrow: string;
  readonly heading: string;
  readonly supportingParagraph: string;
  readonly tiles: ReadonlyArray<MediaView>;
  readonly roles: ReadonlyArray<string>;
}

export interface WorkSectionView {
  readonly intro: { readonly eyebrow: string; readonly heading: string };
  readonly exploreCta: CtaView;
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
    eyebrow: hero.eyebrow,
    headlineLines: hero.headlineLines,
    subhead: hero.subhead,
    primaryCta: toCtaView(hero.primaryCta),
    secondaryCta: toCtaView(hero.secondaryCta),
    media: toMediaView(hero.media),
    mosaicTiles: hero.mosaicTiles.map(toMediaView),
  };
}

export function toManifestoBlockView(manifesto: ManifestoBlock): ManifestoBlockView {
  return {
    eyebrow: manifesto.eyebrow,
    statementLines: manifesto.statementLines,
    supportingParagraph: manifesto.supportingParagraph,
    cta: toCtaView(manifesto.cta),
  };
}

export function toPositioningBlockView(positioning: PositioningBlock): PositioningBlockView {
  return {
    eyebrow: positioning.eyebrow,
    heading: positioning.heading,
    supportingParagraph: positioning.supportingParagraph,
    media: toMediaView(positioning.media),
  };
}

export function toShowreelClipView(clip: ShowreelClip): ShowreelClipView {
  return { client: clip.client, quote: clip.quote, media: toMediaView(clip.media) };
}

export function toCaseStudyView(caseStudy: CaseStudy): CaseStudyView {
  return {
    slug: caseStudy.slug.value,
    client: caseStudy.client,
    title: caseStudy.title,
    tags: caseStudy.tags.map((tag) => tag.label),
    media: toMediaView(caseStudy.media),
  };
}

export function toComparisonCriterionView(criterion: ComparisonCriterion): ComparisonCriterionView {
  return { label: criterion.label, valuesByColumn: criterion.valuesByColumn };
}

export function toFooterContentView(footer: FooterContent): FooterContentView {
  return {
    tagline: footer.tagline,
    contactEmail: footer.contactEmail,
    legalLinks: footer.legalLinks.map(toCtaView),
    socialLinks: footer.socialLinks.map(toCtaView),
  };
}

export function toTalentBlockView(talent: TalentBlock): TalentBlockView {
  return {
    eyebrow: talent.eyebrow,
    heading: talent.heading,
    supportingParagraph: talent.supportingParagraph,
    tiles: talent.tiles.map(toMediaView),
    roles: talent.roles,
  };
}

export function toWorkSectionView(work: WorkSection): WorkSectionView {
  return { intro: work.intro, exploreCta: toCtaView(work.exploreCta) };
}
