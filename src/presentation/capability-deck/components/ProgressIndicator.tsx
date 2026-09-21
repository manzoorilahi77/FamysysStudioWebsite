import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'

interface ProgressIndicatorProps {
  readonly index: number
  readonly total: number
  readonly onJump: (index: number) => void
  readonly compact?: boolean | undefined
}

export function ProgressIndicator({ index, total, onJump, compact = false }: ProgressIndicatorProps) {
  return (
    <div style={compact ? styles.wrapCompact : styles.wrap} role="tablist" aria-label="Slide progress">
      <span style={compact ? styles.countCompact : styles.count} aria-hidden="true">
        {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      <div style={compact ? styles.trackCompact : styles.track}>
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => onJump(i)}
            style={compact ? styles.segmentButtonCompact : styles.segmentButton}
          >
            <motion.span
              style={compact ? styles.segmentCompact : styles.segment}
              whileHover={{ scaleY: 2, background: 'var(--color-cream-faint)' }}
              transition={{ duration: 0.15 }}
            >
              {i === index && (
                <motion.span
                  layoutId="progress-fill"
                  style={styles.segmentFill}
                  transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                />
              )}
            </motion.span>
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  wrapCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
    flex: 1,
  },
  count: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    letterSpacing: '0.1em',
    color: 'var(--color-cream-faint)',
    minWidth: '64px',
  },
  countCompact: {
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    letterSpacing: '0.08em',
    color: 'var(--color-cream-faint)',
    flexShrink: 0,
  },
  track: {
    display: 'flex',
    gap: '6px',
    minWidth: 0,
  },
  // Fills whatever width wrapCompact (flex: 1) leaves after the slide count
  // and the fixed-width nav buttons, so each segment's tap target grows with
  // the viewport instead of staying pinned to a fixed px value that's fine
  // on a tablet and far under a 44px touch target on a 320px phone.
  trackCompact: {
    display: 'flex',
    flex: 1,
    gap: '3px',
    minWidth: 0,
  },
  segmentButton: {
    padding: '10px 0',
  },
  // Visual dot stays slim (segmentCompact below); the button itself is the
  // real hit target — flex: 1 so it shares trackCompact's width equally with
  // its siblings, and vertical padding brings it to a 44px-tall tap area.
  // minWidth is deliberately low: at 7 segments plus the counter and the two
  // 44px nav buttons, a 320px phone has ~14px of track width per segment
  // once everything else is accounted for — a higher floor doesn't leave
  // room to shrink into and the track overflows under the nav buttons.
  segmentButtonCompact: {
    flex: 1,
    minWidth: '14px',
    padding: '21px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    display: 'block',
    width: '40px',
    height: '2px',
    background: 'var(--color-ink-line)',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative',
  },
  segmentCompact: {
    display: 'block',
    width: '100%',
    height: '2px',
    background: 'var(--color-ink-line)',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative',
  },
  segmentFill: {
    position: 'absolute',
    inset: 0,
    background: 'var(--color-accent-on-dark)',
    borderRadius: '2px',
  },
} satisfies Record<string, CSSProperties>
