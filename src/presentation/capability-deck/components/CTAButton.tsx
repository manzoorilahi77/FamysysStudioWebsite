import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { EASE_LUX } from './motion'
import { useIsMobile } from './ViewportContext'

/**
 * Filled primary button matching the real Famysys Studio site's CTA
 * (bg-accent / text-canvas / rounded-sm, darkening on hover) — same token
 * names as studio.famysys.com, not an invented style.
 */
interface CTAButtonProps {
  readonly href: string
  readonly children?: ReactNode | undefined
}

export function CTAButton({ href, children }: CTAButtonProps) {
  const isMobile = useIsMobile()

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...styles.btn,
        padding: isMobile ? '16px 24px' : '22px 40px',
        fontSize: isMobile ? '15px' : '19px',
      }}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: { scale: 1, y: 0, background: 'var(--color-accent)' },
        hover: { scale: 1.035, y: -3, background: 'var(--color-accent-hover)' },
        tap: { scale: 0.97, y: 0 },
      }}
      transition={{ duration: 0.2, ease: EASE_LUX }}
    >
      {children}
      <motion.span style={styles.arrowWrap} variants={{ rest: { x: 0 }, hover: { x: 4 }, tap: { x: 4 } }}>
        <ArrowRight size={isMobile ? 16 : 18} strokeWidth={1.75} />
      </motion.span>
    </motion.a>
  )
}

const styles = {
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    color: 'var(--color-cream)',
    textDecoration: 'none',
    width: 'fit-content',
    background: 'var(--color-accent)',
  },
  arrowWrap: {
    display: 'inline-flex',
  },
} satisfies Record<string, CSSProperties>
