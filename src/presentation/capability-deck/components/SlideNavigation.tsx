import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EASE_LUX } from './motion'

const hoverProps = {
  whileHover: { scale: 1.08, borderColor: 'var(--color-cream-faint)' },
  whileTap: { scale: 0.94 },
  transition: { duration: 0.18, ease: EASE_LUX },
}

interface SlideNavigationProps {
  readonly onPrev: () => void
  readonly onNext: () => void
  readonly canPrev: boolean
  readonly canNext: boolean
}

export function SlideNavigation({ onPrev, onNext, canPrev, canNext }: SlideNavigationProps) {
  return (
    <div style={styles.wrap}>
      <motion.button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous slide"
        style={{ ...styles.btn, opacity: canPrev ? 1 : 0.25 }}
        {...(canPrev ? hoverProps : {})}
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
      </motion.button>
      <motion.button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next slide"
        style={{ ...styles.btn, opacity: canNext ? 1 : 0.25 }}
        {...(canNext ? hoverProps : {})}
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </motion.button>
    </div>
  )
}

const styles = {
  wrap: {
    display: 'flex',
    gap: '4px',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '999px',
    border: '1px solid var(--color-ink-line)',
    color: 'var(--color-cream)',
  },
} satisfies Record<string, CSSProperties>
