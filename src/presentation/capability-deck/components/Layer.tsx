import { motion } from 'framer-motion'
import type { MotionStyle } from 'framer-motion'
import type { ReactNode } from 'react'
import { layerVariants, reducedLayerVariants } from './motion'
import { useReducedMotionPref } from './MotionPrefContext'
import { useTransitionPreset } from './TransitionPresetContext'

/**
 * A parallax layer within a slide. Depth controls how far it travels
 * relative to sibling layers during the slide transition (see motion.js).
 * The active transition preset (axis/distance/scale, one per slide
 * boundary) comes from TransitionPresetContext. Variants are inherited
 * from the slide wrapper's animate state — no `animate`/`initial`/`exit`
 * props needed here. Falls back to a plain crossfade when the viewer
 * prefers reduced motion.
 */
interface LayerProps {
  readonly depth?: number | undefined
  readonly className?: string | undefined
  readonly style?: MotionStyle | undefined
  readonly children?: ReactNode | undefined
}

// framer-motion declares `className?: string` and `style?: MotionStyle` without an
// explicit `| undefined`, which exactOptionalPropertyTypes reads as "may be omitted,
// may not be set to undefined". These pass-through props are optional here, so they
// are spread in only when present. React makes no distinction between an absent prop
// and one set to undefined, so this renders exactly as his version did.
export function Layer({ depth = 1, className, style, children }: LayerProps) {
  const reduced = useReducedMotionPref()
  const { preset, direction } = useTransitionPreset()
  return (
    <motion.div
      {...(className === undefined ? {} : { className })}
      {...(style === undefined ? {} : { style })}
      custom={direction}
      variants={reduced ? reducedLayerVariants() : layerVariants(depth, preset)}
    >
      {children}
    </motion.div>
  )
}
