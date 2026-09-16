import type { CSSProperties } from 'react'
interface ProcessStepProps {
  readonly index: string
  readonly title: string
  readonly copy: string
  readonly isLast: boolean
  readonly compact?: boolean | undefined
  readonly vertical?: boolean | undefined
}

export function ProcessStep({ index, title, copy, isLast, compact = false, vertical = false }: ProcessStepProps) {
  return (
    <div style={{ ...styles.step, gap: compact ? '10px' : '18px' }}>
      <div style={styles.top}>
        <span style={{ ...styles.index, fontSize: compact ? '28px' : '42px' }}>{index}</span>
        {!isLast && !vertical && <span style={styles.connector} aria-hidden="true" />}
        {!isLast && vertical && <span style={styles.connectorVertical} aria-hidden="true" />}
      </div>
      <h3 style={{ ...styles.title, fontSize: compact ? '18px' : '24px' }}>{title}</h3>
      <p
        style={{
          ...styles.copy,
          fontSize: compact ? '14px' : '16.5px',
          maxWidth: compact ? 'none' : '300px',
        }}
      >
        {copy}
      </p>
    </div>
  )
}

const styles = {
  step: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'relative',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  index: {
    fontFamily: 'var(--font-display)',
    color: 'var(--color-cream-faint)',
    flexShrink: 0,
  },
  connector: {
    flex: 1,
    height: '1px',
    background: 'var(--color-ink-line)',
    marginLeft: '16px',
  },
  connectorVertical: {
    display: 'none',
  },
  title: {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.01em',
    color: 'var(--color-fg)',
    margin: 0,
  },
  copy: {
    fontFamily: 'var(--font-body)',
    lineHeight: 1.55,
    color: 'var(--color-cream-faint)',
    margin: 0,
  },
} satisfies Record<string, CSSProperties>
