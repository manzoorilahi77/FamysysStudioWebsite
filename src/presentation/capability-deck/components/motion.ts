// Shared cinematic transition system.
// Every slide-to-slide boundary uses a distinct "preset" (axis, distance,
// scale swing, mask-reveal direction, duration) within the SAME push /
// parallax / mask-reveal language — no cube, flip, or 3D rotation, per the
// brand brief. Layers within a slide still move at different multiples of
// the preset's base distance for parallax depth.

import type { Direction, MaskDirection, TransitionPreset } from '../types'

// Tuple, not number[]: framer-motion's `ease` takes a fixed four-value cubic
// bezier and will not accept a widened array.
export const EASE_LUX: [number, number, number, number] = [0.65, 0, 0.35, 1]

export const DEPTH = {
  background: 0.35,
  media: 0.7,
  content: 1,
  decorative: 1.6,
}

const BASE_DISTANCE = 88

// One preset per slide boundary (index i = the transition between slide i
// and slide i+1, used for travel in both directions).
export const TRANSITIONS: ReadonlyArray<TransitionPreset> = [
  { key: 'push', axis: 'x', distance: 1, scale: 1.02, mask: 'left', duration: 0.72 },
  { key: 'rise', axis: 'y', distance: 0.85, scale: 1.02, mask: 'top', duration: 0.76 },
  { key: 'zoom', axis: 'x', distance: 0.55, scale: 1.1, mask: 'center', duration: 0.8 },
  { key: 'wipe', axis: 'xy', distance: 1, scale: 1.03, mask: 'right', duration: 0.74 },
  { key: 'pull', axis: 'x', distance: 1.25, scale: 1.06, mask: 'center', duration: 0.85 },
  { key: 'settle', axis: 'y', distance: 0.45, scale: 1.015, mask: 'bottom', duration: 0.95 },
]

/** The first preset, as a definite value — TRANSITIONS is a non-empty literal. */
const DEFAULT_PRESET: TransitionPreset = {
  key: 'push',
  axis: 'x',
  distance: 1,
  scale: 1.02,
  mask: 'left',
  duration: 0.72,
}

export function layerVariants(depth = 1, preset: TransitionPreset = DEFAULT_PRESET) {
  const dist = BASE_DISTANCE * depth * (preset.distance ?? 1)
  const isDecorative = depth >= DEPTH.decorative
  const isBackground = depth <= DEPTH.background
  const enterScale = isBackground ? 1 : preset.scale ?? 1.02
  const exitScale = isBackground ? 1 : 1 - (enterScale - 1) * 0.5
  const useX = preset.axis !== 'y'
  const useY = preset.axis === 'y' || preset.axis === 'xy'
  const yFactor = preset.axis === 'xy' ? 0.5 : 1
  const duration = preset.duration ?? 0.72

  return {
    enter: (direction: Direction) => ({
      x: useX ? (direction >= 0 ? dist : -dist) : 0,
      y: useY ? (direction >= 0 ? dist * yFactor : -dist * yFactor) : 0,
      scale: enterScale,
      opacity: 0,
    }),
    center: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration,
        ease: EASE_LUX,
        delay: isBackground ? 0 : isDecorative ? 0.08 : 0.03,
      },
    },
    exit: (direction: Direction) => ({
      x: useX ? (direction >= 0 ? -dist * 0.65 : dist * 0.65) : 0,
      y: useY ? (direction >= 0 ? -dist * yFactor * 0.65 : dist * yFactor * 0.65) : 0,
      scale: exitScale,
      // Fully clear on exit. Partial opacity (0.4 / 0.7) looked cinematic
      // while the leaving slide was still mounted, but if AnimatePresence
      // ever orphans that node it stays readable under every later slide.
      opacity: 0,
      transition: {
        duration: duration * 0.83,
        ease: EASE_LUX,
      },
    }),
  }
}

// Reduced-motion fallback: simple opacity crossfade, no push or scale.
export function reducedLayerVariants() {
  return {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }
}

interface MaskClip {
  readonly enter: string
  readonly center: string
  readonly exit: string
}

const MASK_CLIPS: Record<MaskDirection, MaskClip> = {
  left: { enter: 'inset(0 100% 0 0)', center: 'inset(0 0% 0 0)', exit: 'inset(0 0 0 100%)' },
  right: { enter: 'inset(0 0 0 100%)', center: 'inset(0 0% 0 0)', exit: 'inset(0 100% 0 0)' },
  top: { enter: 'inset(100% 0 0 0)', center: 'inset(0% 0 0 0)', exit: 'inset(0 0 100% 0)' },
  bottom: { enter: 'inset(0 0 100% 0)', center: 'inset(0 0 0% 0)', exit: 'inset(100% 0 0 0)' },
  center: { enter: 'inset(0 50% 0 50%)', center: 'inset(0 0% 0 0%)', exit: 'inset(0 50% 0 50%)' },
}

export function sectionMaskVariants(mask: MaskDirection = 'left') {
  const c = MASK_CLIPS[mask] || MASK_CLIPS.left
  return {
    enter: { clipPath: c.enter },
    center: {
      clipPath: c.center,
      transition: { duration: 1.05, ease: EASE_LUX, delay: 0.05 },
    },
    exit: {
      clipPath: c.exit,
      transition: { duration: 0.5, ease: EASE_LUX },
    },
  }
}
