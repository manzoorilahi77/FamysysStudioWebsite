import { motion } from 'framer-motion'
import type { MotionStyle } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_LUX } from './motion'
import { useReducedMotionPref } from './MotionPrefContext'

// Orchestrates a staggered entrance for a group of items (cards, pillars,
// steps) — each child arrives slightly after the previous one instead of
// all at once, reinforcing reading order. Carries no visual properties of
// its own; it just times its children via variant propagation from the
// slide's existing push/parallax state (enter/center/exit).
const containerVariants = {
  enter: {},
  center: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}

const itemVariants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_LUX } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASE_LUX } },
}

const reducedItemVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

type StaggerTag = 'div' | 'ul' | 'ol' | 'li' | 'section' | 'span' | 'p'

interface StaggerProps {
  readonly as?: StaggerTag | undefined
  readonly className?: string | undefined
  readonly style?: MotionStyle | undefined
  readonly children?: ReactNode | undefined
}

// framer-motion declares `className?: string` and `style?: MotionStyle` without an
// explicit `| undefined`, which exactOptionalPropertyTypes reads as "may be omitted,
// may not be set to undefined". These pass-through props are optional here, so they
// are spread in only when present. React makes no distinction between an absent prop
// and one set to undefined, so this renders exactly as his version did.
export function StaggerGroup({ as = 'div', className, style, children }: StaggerProps) {
  const Tag = motion[as]
  return (
    <Tag
      {...(className === undefined ? {} : { className })}
      {...(style === undefined ? {} : { style })}
      variants={containerVariants}
    >
      {children}
    </Tag>
  )
}

export function StaggerItem({ as = 'div', className, style, children }: StaggerProps) {
  const reduced = useReducedMotionPref()
  const Tag = motion[as]
  return (
    <Tag
      {...(className === undefined ? {} : { className })}
      {...(style === undefined ? {} : { style })}
      variants={reduced ? reducedItemVariants : itemVariants}
    >
      {children}
    </Tag>
  )
}
