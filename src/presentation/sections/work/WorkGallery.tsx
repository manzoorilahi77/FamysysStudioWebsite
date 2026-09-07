"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  WorkDetailLabels,
  WorkFilterBlock,
} from "../../../domain/portfolio/entities/SelectedWorkPage";
import { motion } from "../../../shared/design/tokens";
import { Container } from "../../components/Container";
import { Reveal } from "../../components/Reveal";
import { Section } from "../../components/Section";
import { WorkDetailDialog } from "../../components/WorkDetailDialog";
import { WorkTile } from "../../components/WorkTile";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { CaseStudyDetailView } from "../../lib/viewModels";

interface WorkGalleryProps {
  readonly gridLabel: string;
  readonly filter: WorkFilterBlock;
  readonly pieces: ReadonlyArray<CaseStudyDetailView>;
  readonly statusLabel: string;
  readonly statusExplanation: string;
  readonly detail: WorkDetailLabels;
}

/**
 * The filter and the grid are one section, not two, because the chips control the grid:
 * `aria-controls` needs something to point at, and a fieldset of controls floating in
 * its own landmark above the thing it filters is a worse structure than the brief's
 * numbering implies.
 *
 * FILTERING CHANGES THE RENDERED SET. The chips do not hide tiles with CSS — the filtered
 * set is what React renders, so a screen reader and a search crawler see the same eight,
 * or three, that a sighted reader does. The transition is a fade of the grid between the
 * two states rather than a snap: `active` is what the controls report immediately, and
 * `rendered` is what the DOM holds, which lags it by one fade. Under reduced motion the
 * two are the same value and the swap is instant.
 *
 * THE INCOMING SET SETTLES RATHER THAN APPEARING. Each tile's wrapper is keyed on the
 * rendered category as well as its slug, so a filter change remounts the wrappers and the
 * standard reveal runs again — every tile fades and rises into its new position over the
 * base 320ms rather than the grid cutting from one arrangement to another. Under reduced
 * motion the key is the slug alone: the tiles that survive the filter are reused, so
 * nothing re-animates, and the swap is the instant one the motion brief asks for.
 *
 * The URL fragment is the detail view's address. See WorkDetailDialog for why the detail
 * is a panel rather than eight routes, and why it is still linkable.
 */
export function WorkGallery({
  gridLabel,
  filter,
  pieces,
  statusLabel,
  statusExplanation,
  detail,
}: WorkGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [renderedCategory, setRenderedCategory] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (activeCategory === renderedCategory) {
      return;
    }
    if (prefersReducedMotion) {
      setRenderedCategory(activeCategory);
      return;
    }
    setIsSwapping(true);
    const timer = window.setTimeout(() => {
      setRenderedCategory(activeCategory);
      setIsSwapping(false);
    }, motion.duration.fast);
    return () => window.clearTimeout(timer);
  }, [activeCategory, renderedCategory, prefersReducedMotion]);

  // The navigation has linked `/selected-work#<slug>` since before this page existed.
  // Arriving on one scrolls to the tile (the browser does that) and opens its detail.
  useEffect(() => {
    function openFromHash(): void {
      const slug = window.location.hash.replace(/^#/, "");
      if (slug && pieces.some((piece) => piece.slug === slug)) {
        setOpenSlug(slug);
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [pieces]);

  const openPiece = useCallback((slug: string) => {
    setOpenSlug(slug);
    window.history.replaceState(null, "", `#${slug}`);
  }, []);

  const closePiece = useCallback(() => {
    setOpenSlug(null);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const visible =
    renderedCategory === null
      ? pieces
      : pieces.filter((piece) =>
          piece.capabilities.some((capability) => capability.title === renderedCategory),
        );

  const open = pieces.find((piece) => piece.slug === openSlug);
  const generation = renderedCategory ?? filter.allLabel;

  return (
    <Section ariaLabel={gridLabel} className="work-section">
      <Container>
        <p id="work-filter-label" className="label text-ink-70">
          {filter.label}
        </p>
        <div className="work-filter mt-4" role="group" aria-labelledby="work-filter-label">
          <button
            type="button"
            className="work-filter-chip"
            aria-pressed={activeCategory === null}
            aria-controls="work-grid"
            onClick={() => setActiveCategory(null)}
          >
            <span>{filter.allLabel}</span>
            <span className="work-filter-count">{pieces.length}</span>
          </button>
          {filter.categories.map((category) => (
            <button
              key={category.title}
              type="button"
              className="work-filter-chip"
              aria-pressed={activeCategory === category.title}
              aria-controls="work-grid"
              onClick={() => setActiveCategory(category.title)}
            >
              <span>{category.title}</span>
              <span className="work-filter-count">{category.count}</span>
            </button>
          ))}
        </div>
        {/* Named without a count, deliberately: a live region that reads a number every
            time a chip is pressed is noise, and the grid itself carries the result. */}
        <p className="sr-only" role="status">
          {activeCategory ?? filter.allLabel}
        </p>

        {/* Tiles run ACROSS a row, so the numbering reads 01 02 / 03 04 rather than down
            one column and back up the other. Filtering re-pairs the rows, which is why the
            ratio spread is bounded by a capped media height rather than by hand-pairing
            what sits beside what — see .work-grid. */}
        <div
          id="work-grid"
          className="work-grid mt-14"
          style={{
            opacity: isSwapping ? 0 : 1,
            transitionProperty: "opacity",
            transitionDuration: `${prefersReducedMotion ? motion.duration.reduced : motion.duration.fast}ms`,
            transitionTimingFunction: "var(--ease-base)",
          }}
        >
          {visible.map((piece, index) => (
            <Reveal
              key={prefersReducedMotion ? piece.slug : `${generation}:${piece.slug}`}
              index={index % 2}
              staggerStepMs={60}
              className="work-grid-item"
            >
              <WorkTile
                piece={piece}
                statusLabel={statusLabel}
                isPriority={index === 0}
                onOpen={() => openPiece(piece.slug)}
              />
            </Reveal>
          ))}
        </div>
      </Container>

      {open ? (
        <WorkDetailDialog
          key={open.slug}
          piece={open}
          labels={detail}
          statusLabel={statusLabel}
          statusExplanation={statusExplanation}
          onClosed={closePiece}
        />
      ) : null}
    </Section>
  );
}
