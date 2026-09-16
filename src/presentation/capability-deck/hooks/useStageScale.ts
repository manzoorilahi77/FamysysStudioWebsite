import { useEffect, useState } from 'react'

const STAGE_W = 1920
const STAGE_H = 1080

// How much of the fixed-canvas safe margin (see components/layout.js) we
// allow the "fill" mode to crop into before it's considered destructive.
// Kept comfortably inside the real safe-area values so cropping only ever
// eats into empty margin, never headline/body content.
// Chosen to comfortably fill common non-16:9 desktop/laptop ratios (16:10,
// 16:9.6, etc.) edge-to-edge while staying inside the persistent chrome's
// own inset (see PresentationShell's chromeTop/chromeBottom margins, which
// are sized to exceed these values) so the logo and nav are never clipped.
const MAX_CROP_X = 100
const MAX_CROP_Y = 40

// Below this width — or portrait phones/tablets — we abandon the fixed
// 1920×1080 canvas and let the stage equal the viewport so slides can
// reflow instead of becoming unreadably small letterboxed miniatures.
const MOBILE_MAX_WIDTH = 900

interface StageScale {
  readonly scale: number
  readonly fill: boolean
  readonly isMobile: boolean
  readonly stageWidth: number
  readonly stageHeight: number
}

function isMobileViewport(vw: number, vh: number): boolean {
  return vw <= MOBILE_MAX_WIDTH || (vh > vw && vw <= 1100)
}

function computeScale(vw: number, vh: number): StageScale {
  if (isMobileViewport(vw, vh)) {
    return {
      scale: 1,
      fill: true,
      isMobile: true,
      stageWidth: vw,
      stageHeight: vh,
    }
  }

  const containScale = Math.min(vw / STAGE_W, vh / STAGE_H)
  const coverScale = Math.max(vw / STAGE_W, vh / STAGE_H)

  const displayedW = STAGE_W * coverScale
  const displayedH = STAGE_H * coverScale
  const cropXHalf = Math.max(0, (displayedW - vw) / 2 / coverScale)
  const cropYHalf = Math.max(0, (displayedH - vh) / 2 / coverScale)

  // On a normal desktop/laptop/ultrawide window the crop stays inside the
  // slide's empty margin, so we fill the browser edge-to-edge with zero
  // visible letterboxing. Only extreme aspect ratios (tall mobile portrait)
  // fall back to a fully-contained, letterboxed canvas so real content
  // never gets clipped.
  const fill = cropXHalf <= MAX_CROP_X && cropYHalf <= MAX_CROP_Y

  return {
    scale: fill ? coverScale : containScale,
    fill,
    isMobile: false,
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
  }
}

function readViewportSize() {
  const vv = typeof window !== 'undefined' ? window.visualViewport : null
  return {
    vw: Math.round(vv?.width || window.innerWidth),
    vh: Math.round(vv?.height || window.innerHeight),
  }
}

export function useStageScale(): StageScale {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return { scale: 1, fill: true, isMobile: false, stageWidth: STAGE_W, stageHeight: STAGE_H }
    }
    const { vw, vh } = readViewportSize()
    return computeScale(vw, vh)
  })

  useEffect(() => {
    function recalc() {
      const { vw, vh } = readViewportSize()
      setState(computeScale(vw, vh))
    }
    recalc()
    window.addEventListener('resize', recalc)
    window.addEventListener('orientationchange', recalc)
    window.visualViewport?.addEventListener('resize', recalc)
    window.visualViewport?.addEventListener('scroll', recalc)
    return () => {
      window.removeEventListener('resize', recalc)
      window.removeEventListener('orientationchange', recalc)
      window.visualViewport?.removeEventListener('resize', recalc)
      window.visualViewport?.removeEventListener('scroll', recalc)
    }
  }, [])

  return state
}
