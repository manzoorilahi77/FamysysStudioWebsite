import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'

/**
 * Persistent "01 — COVER" style index label. Uses a layoutId on the number
 * so it glides to its new position/value across slide changes instead of
 * hard-cutting — a small shared-element continuity touch.
 */
interface SectionLabelProps {
  readonly index: number
  readonly total: number
  readonly title: string
}

export function SectionLabel({ index, total, title }: SectionLabelProps) {
  return (
    <div style={styles.wrap}>
      <motion.span layoutId="section-index" style={styles.index} transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}>
        {String(index).padStart(2, '0')}
      </motion.span>
      <span style={styles.slash}>/</span>
      <span style={styles.total}>{String(total).padStart(2, '0')}</span>
      <span style={styles.dash}>—</span>
      <span style={styles.title}>{title}</span>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '10px',
    fontFamily: 'var(--font-body)',
  },
  index: {
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'var(--color-cream)',
  },
  slash: {
    fontSize: '15px',
    color: 'var(--color-cream-faint)',
  },
  total: {
    fontSize: '15px',
    color: 'var(--color-cream-faint)',
  },
  dash: {
    fontSize: '15px',
    color: 'var(--color-cream-faint)',
    margin: '0 2px',
  },
  title: {
    fontSize: '15px',
    fontWeight: 500,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--color-cream-dim)',
  },
} satisfies Record<string, CSSProperties>
