"use client";

import type { CSSProperties, PointerEvent } from "react";
import { useRef } from "react";
import type { ServiceOffering } from "../../domain/services/entities/ServiceOffering";
import { motion } from "../../shared/design/tokens";
import { useGridColumns } from "../hooks/useGridColumns";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface ServiceGridProps {
  readonly capabilities: ReadonlyArray<ServiceOffering>;
}

interface ServiceCellProps {
  readonly capability: ServiceOffering;
  /** Two-digit index, 01–06. Presentational only — see the `aria-hidden` note below. */
  readonly numeral: string;
  /** Diagonal entry delay, computed by the grid from this cell's row and column. */
  readonly delayMs: number;
  readonly showWash: boolean;
  readonly onEnter: ((event: PointerEvent<HTMLDivElement>) => void) | undefined;
}

/**
 * One cell: title, a real gap, descriptor, and a watermark numeral cropped by the bottom
 * edge. No border, no margin and NO BACKGROUND — the cell is flush against its neighbours,
 * contributes its own right and bottom hairline, and otherwise lets the section's canvas
 * show straight through. That is how the grid ends up sharing edges instead of stacking two
 * borders at every seam, and how it reads as one plane rather than six tiles. The light
 * navy fill arrives on hover and only on hover. See the `.service-*` block in globals.css.
 *
 * The numeral carries `aria-hidden` for the same reason §Why Famysys's does: it is a
 * visual index of an unordered set of six capabilities, not part of the copy, and read
 * aloud "zero one" before "Creative Design" is noise. That also keeps it out of axe's
 * contrast rule, which is the correct outcome — at ink-08 it is deliberately far below the
 * text floor, and it is allowed to be, precisely because nothing is lost by not being able
 * to read one.
 *
 * There is no arrow. The one this replaced revealed on hover and pointed at nothing — the
 * cells have never been links, and the section's only destination is its CTA.
 */
function ServiceCell({ capability, numeral, delayMs, showWash, onEnter }: ServiceCellProps) {
  const cellStyle = {
    "--cell-delay": `${delayMs}ms`,
    "--numeral-delay": `${delayMs + motion.gridDraw.numeralTrailMs}ms`,
  } as CSSProperties;

  return (
    <div
      className="service-cell"
      style={cellStyle}
      {...(onEnter ? { onPointerEnter: onEnter } : {})}
    >
      {showWash ? <span className="service-wash" aria-hidden="true" /> : null}

      <div className="service-cell-body">
        <p className="service-title text-display-s font-semibold text-ink">{capability.title}</p>
        <p className="service-descriptor text-small text-ink-70">{capability.description}</p>
      </div>

      <span
        className="service-numeral decorative-numeral tabular"
        data-numeral={numeral}
        aria-hidden="true"
      />

      {/* Last in the DOM so the hairlines paint over the body rather than under it — both
          are positioned with auto z-index, so DOM order is the whole ordering rule. */}
      <span className="service-rule service-rule--v" aria-hidden="true" />
      <span className="service-rule service-rule--h" aria-hidden="true" />
    </div>
  );
}

/**
 * The six capabilities as one bordered container divided by hairlines. Three columns at
 * lg, two at md, one below — and the hairline structure follows from the layout rather
 * than being told about it, because every cell draws its own right and bottom rule and
 * the container draws only the top and left. At one column the vertical rules line up
 * into the outer right edge and no internal vertical exists, which is the single-column
 * behaviour the design asks for, arrived at for free.
 *
 * `auto-rows-fr` is load-bearing, not a tidiness flag: it makes every row the height of
 * the tallest cell, which is what puts all six numerals on the same baseline. The numeral
 * is the last flow item under a `margin-top: auto`, so it pins to the bottom of its cell
 * however much copy sits above it — the consistency that makes the grid read as a system.
 *
 * Entry is a sequence, not a fade: the outer top and left edges draw from the corner, the
 * internal hairlines follow (verticals, then horizontals a step behind), the cells rise
 * on the diagonal, and the numerals come up last. `data-drawn` is the single switch that
 * starts all of it; every delay is a CSS custom property so the whole sequence is one
 * `transition-delay` cascade rather than a chain of timers.
 */
export function ServiceGrid({ capabilities }: ServiceGridProps) {
  const [gridRef, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, once: true });
  const prefersReducedMotion = useReducedMotion();
  const columns = useGridColumns();
  const markerRef = useRef<HTMLSpanElement>(null);

  /**
   * Parks the marker on the bottom-right corner of the cell the cursor just entered.
   * Written straight to the element rather than held in state: one square does not
   * justify re-rendering six cells, and the CSS transition on `transform` is what makes
   * the square travel to the new corner instead of blinking there.
   *
   * `pointerType` is checked because a tap fires `pointerenter` too, and the square is a
   * hover affordance — on touch it should simply never appear.
   */
  function moveMarker(event: PointerEvent<HTMLDivElement>): void {
    if (event.pointerType !== "mouse") {
      return;
    }
    const grid = gridRef.current;
    const marker = markerRef.current;
    if (!grid || !marker) {
      return;
    }
    const gridBox = grid.getBoundingClientRect();
    const cellBox = event.currentTarget.getBoundingClientRect();
    marker.style.setProperty("--marker-x", `${cellBox.right - gridBox.left}px`);
    marker.style.setProperty("--marker-y", `${cellBox.bottom - gridBox.top}px`);
    marker.style.setProperty("--marker-opacity", "1");
  }

  function hideMarker(): void {
    markerRef.current?.style.setProperty("--marker-opacity", "0");
  }

  const gridStyle = {
    "--rule-v-delay": prefersReducedMotion ? "0ms" : `${motion.gridDraw.verticalDelayMs}ms`,
    "--rule-h-delay": prefersReducedMotion ? "0ms" : `${motion.gridDraw.horizontalDelayMs}ms`,
  } as CSSProperties;

  return (
    <div
      ref={gridRef}
      className="service-grid mt-14 grid auto-rows-fr md:grid-cols-2 lg:grid-cols-3"
      style={gridStyle}
      data-drawn={isInView}
      {...(prefersReducedMotion ? {} : { onPointerLeave: hideMarker })}
    >
      {capabilities.map((capability, index) => (
        <ServiceCell
          key={capability.title}
          capability={capability}
          numeral={String(index + 1).padStart(2, "0")}
          delayMs={
            prefersReducedMotion
              ? 0
              : motion.gridDraw.cellDelayMs +
                (Math.floor(index / columns) + (index % columns)) * motion.stagger.diagonalStepMs
          }
          showWash={!prefersReducedMotion}
          onEnter={prefersReducedMotion ? undefined : moveMarker}
        />
      ))}

      {/* After the cells, so the two owned edges paint over the first row and column
          rather than under them. */}
      <span className="service-edge service-edge--top" aria-hidden="true" />
      <span className="service-edge service-edge--left" aria-hidden="true" />
      {prefersReducedMotion ? null : (
        <span ref={markerRef} className="service-marker" aria-hidden="true" />
      )}
    </div>
  );
}
