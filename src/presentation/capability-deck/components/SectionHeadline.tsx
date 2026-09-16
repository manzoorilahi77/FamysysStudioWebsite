import { motion } from 'framer-motion'
import type { MotionStyle } from 'framer-motion'
import type { ReactNode } from 'react'
import { sectionMaskVariants } from './motion'
import { useReducedMotionPref } from './MotionPrefContext'
import { useTransitionPreset } from './TransitionPresetContext'

/**
 * Wraps a slide's main headline in its own clip-path mask reveal —
 * the "typography-led section transition" from the brief, layered on top
 * of (not replacing) the shared push/parallax system every slide already
 * uses. Every slide here is its own major section, so every slide gets it.
 * The wipe direction (left/right/top/bottom/center) comes from the active
 * transition preset, so each slide boundary's reveal reads distinctly.
 */
// The element the headline renders as, narrowed to the tags his slides
// actually pass so that motion[as] indexes a known key.
type HeadlineTag = 'h1' | 'h2' | 'h3' | 'div' | 'span' | 'p'

interface SectionHeadlineProps {
  readonly as?: HeadlineTag | undefined
  readonly className?: string | undefined
  readonly style?: MotionStyle | undefined
  readonly children?: ReactNode | undefined
}

// framer-motion declares `className?: string` and `style?: MotionStyle` without an
// explicit `| undefined`, which exactOptionalPropertyTypes reads as "may be omitted,
// may not be set to undefined". These pass-through props are optional here, so they
// are spread in only when present. React makes no distinction between an absent prop
// and one set to undefined, so this renders exactly as his version did.
export function SectionHeadline({ as = 'h2', className, style, children }: SectionHeadlineProps) {
  const reduced = useReducedMotionPref()
  const { preset } = useTransitionPreset()
  const Tag = motion[as]
  return (
    <Tag
      {...(className === undefined ? {} : { className })}
      {...(style === undefined ? {} : { style })}
      {...(reduced ? {} : { variants: sectionMaskVariants(preset.mask) })}
    >
      {children}
    </Tag>
  )
}
