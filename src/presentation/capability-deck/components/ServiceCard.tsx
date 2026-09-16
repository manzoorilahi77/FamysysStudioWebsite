import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { EASE_LUX } from './motion'

interface ServiceCardProps {
  readonly number: string
  readonly title: string
  readonly tagline: string
  readonly examples: ReadonlyArray<string>
  readonly compact?: boolean | undefined
}

export function ServiceCard({ number, title, tagline, examples, compact = false }: ServiceCardProps) {
  return (
    <motion.div
      style={{ ...styles.card, paddingTop: compact ? '14px' : '24px', gap: compact ? '8px' : '14px' }}
      {...(compact ? {} : { whileHover: { y: -6, borderColor: 'var(--color-cream-faint)' } })}
      transition={{ duration: 0.25, ease: EASE_LUX }}
    >
      <span style={{ ...styles.number, fontSize: compact ? '13px' : '18px' }}>{number}</span>
      <h3 style={{ ...styles.title, fontSize: compact ? '22px' : '40px' }}>{title}</h3>
      <p style={{ ...styles.tagline, fontSize: compact ? '15px' : '22px' }}>{tagline}</p>
      <p style={{ ...styles.examples, fontSize: compact ? '13px' : '18px' }}>{examples.join(' · ')}</p>
    </motion.div>
  )
}

const styles = {
  card: {
    borderTop: '1px solid var(--color-ink-line)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  number: {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-cream-faint)',
    letterSpacing: '0.08em',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    color: 'var(--color-fg)',
    margin: 0,
    lineHeight: 1.15,
  },
  tagline: {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-cream-dim)',
    margin: 0,
    lineHeight: 1.4,
  },
  examples: {
    fontFamily: 'var(--font-body)',
    lineHeight: 1.55,
    color: 'var(--color-cream-faint)',
    margin: '4px 0 0',
  },
} satisfies Record<string, CSSProperties>
