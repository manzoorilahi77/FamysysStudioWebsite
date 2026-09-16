import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { EASE_LUX } from './motion'

interface EngagementCardProps {
  readonly tag: string
  readonly title: string
  readonly audience: string
  readonly examples: ReadonlyArray<string>
  readonly emphasized?: boolean | undefined
  readonly compact?: boolean | undefined
}

export function EngagementCard({ tag, title, audience, examples, emphasized, compact = false }: EngagementCardProps) {
  return (
    <motion.div
      style={{
        ...styles.card,
        ...(emphasized ? styles.cardEmphasized : {}),
        gap: compact ? '12px' : '24px',
        padding: compact ? '20px 16px' : '40px 32px',
      }}
      {...(compact ? {} : { whileHover: { y: -8, borderColor: 'var(--color-cream-faint)' } })}
      transition={{ duration: 0.25, ease: EASE_LUX }}
    >
      <span style={{ ...styles.tag, fontSize: compact ? '12px' : '18px' }}>{tag}</span>
      <h3 style={{ ...styles.title, fontSize: compact ? '22px' : '40px' }}>{title}</h3>
      <p style={{ ...styles.audience, fontSize: compact ? '13px' : '20px' }}>{audience}</p>
      {examples.length > 0 && (
        <div style={{ ...styles.examples, gap: compact ? '6px' : '10px' }}>
          {examples.map((ex: string) => (
            <span key={ex} style={{ ...styles.pill, fontSize: compact ? '11px' : '16px', padding: compact ? '5px 10px' : '9px 15px' }}>
              {ex}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--color-ink-line)',
    borderRadius: 'var(--radius-sm)',
    height: '100%',
    background: 'var(--color-ink-raised)',
  },
  cardEmphasized: {
    borderColor: 'var(--color-cream-faint)',
    background: 'transparent',
  },
  tag: {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--color-cream-dim)',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    color: 'var(--color-fg)',
    margin: 0,
    lineHeight: 1.15,
  },
  audience: {
    fontFamily: 'var(--font-body)',
    lineHeight: 1.5,
    color: 'var(--color-cream-faint)',
    margin: 0,
  },
  examples: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: 'auto',
  },
  pill: {
    fontFamily: 'var(--font-body)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-ink-line)',
    color: 'var(--color-cream-dim)',
  },
} satisfies Record<string, CSSProperties>
