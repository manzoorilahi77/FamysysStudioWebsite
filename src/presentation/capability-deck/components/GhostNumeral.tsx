import type { CSSProperties } from 'react'
/**
 * Oversized, ultra-faint editorial numeral used as the background-depth
 * parallax layer on every content slide (Cover uses the brand mark
 * instead — see CoverSlide.jsx). Ties the "large numbers" editorial motif
 * from the brand system to the slide's own real index, so nothing here is
 * invented copy.
 */
interface GhostNumeralProps {
  readonly value: number
  readonly compact?: boolean | undefined
}

export function GhostNumeral({ value, compact = false }: GhostNumeralProps) {
  return (
    <div style={compact ? styles.wrapCompact : styles.wrap} aria-hidden="true">
      <span style={compact ? styles.numeralCompact : styles.numeral}>{String(value).padStart(2, '0')}</span>
    </div>
  )
}

const styles = {
  wrap: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  numeral: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: '820px',
    lineHeight: 1,
    color: 'var(--color-cream)',
    opacity: 0.045,
    letterSpacing: '-0.03em',
    transform: 'translate(10%, 18%)',
  },
  // Smaller, top-right variant for slides where the lower canvas is
  // occupied by opaque foreground media (Selected Work).
  wrapCompact: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  numeralCompact: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: '340px',
    lineHeight: 1,
    color: 'var(--color-cream)',
    opacity: 0.05,
    letterSpacing: '-0.02em',
    transform: 'translate(14%, -18%)',
  },
} satisfies Record<string, CSSProperties>
