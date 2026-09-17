import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Handshake } from 'lucide-react'
import { EASE_LUX } from './motion'

interface EngagementCardProps {
  readonly tag: string
  readonly title: string
  readonly audience: string
  readonly examples: ReadonlyArray<string>
  readonly emphasized?: boolean | undefined
  readonly compact?: boolean | undefined
}

// Capped rather than showing every example: a card's height is shared with its
// siblings (see EngagementCard height: '100%' below, stretched by the grid to
// the tallest card in the row), so an uncapped list on one card inflates the
// row height for all four and pushes the tallest card's own pills past the
// slide's fixed, non-scrolling viewport.
const MAX_VISIBLE_EXAMPLES = 5

export function EngagementCard({ tag, title, audience, examples, emphasized, compact = false }: EngagementCardProps) {
  const visibleExamples = examples.slice(0, MAX_VISIBLE_EXAMPLES)
  return (
    <motion.div
      style={{
        ...styles.card,
        ...(emphasized ? styles.cardEmphasized : {}),
        gap: compact ? '10px' : '16px',
        padding: compact ? '18px 14px' : '28px 24px',
      }}
      {...(compact ? {} : { whileHover: { y: -8, borderColor: 'var(--color-cream-faint)' } })}
      transition={{ duration: 0.25, ease: EASE_LUX }}
    >
      <div style={{ ...styles.header, gap: compact ? '8px' : '14px', minHeight: compact ? '108px' : '196px' }}>
        <span style={{ ...styles.tag, fontSize: compact ? '12px' : '18px' }}>{tag}</span>
        <h3 style={{ ...styles.title, fontSize: compact ? '22px' : '40px' }}>{title}</h3>
        <p
          style={{
            ...styles.audience,
            fontSize: compact ? '13px' : '20px',
            ...(emphasized && !compact ? styles.audienceEmphasized : {}),
          }}
        >
          {audience}
        </p>
      </div>
      {visibleExamples.length > 0 ? (
        <div style={{ ...styles.examples, gap: compact ? '6px' : '10px' }}>
          {visibleExamples.map((ex: string) => (
            <span key={ex} style={{ ...styles.pill, fontSize: compact ? '11px' : '16px', padding: compact ? '5px 10px' : '9px 15px' }}>
              {ex}
            </span>
          ))}
        </div>
      ) : (
        emphasized && (
          <Handshake
            aria-hidden="true"
            size={compact ? 40 : 64}
            strokeWidth={1}
            style={styles.decorativeIcon}
          />
        )
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
  header: {
    display: 'flex',
    flexDirection: 'column',
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
  // Narrows the emphasized card's body copy onto three lines instead of two,
  // so it reads as deliberately set rather than however the column happened
  // to wrap it.
  audienceEmphasized: {
    maxWidth: '300px',
  },
  examples: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  pill: {
    fontFamily: 'var(--font-body)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-ink-line)',
    color: 'var(--color-cream-dim)',
  },
  decorativeIcon: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
    color: 'var(--color-cream-faint)',
    opacity: 0.35,
  },
} satisfies Record<string, CSSProperties>
