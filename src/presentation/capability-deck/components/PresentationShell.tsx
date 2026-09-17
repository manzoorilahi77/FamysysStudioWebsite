import type { CSSProperties } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Variants } from 'framer-motion'
import type { Direction, SlideEntry, TransitionPreset } from '../types'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize, Minimize } from 'lucide-react'
import { useKeyboardNav } from '../hooks/useKeyboardNav'
import { useSwipeNav } from '../hooks/useSwipeNav'
import { useWheelNav } from '../hooks/useWheelNav'
import { isMediaExpanded } from '../hooks/mediaExpandLock'
import { useStageScale } from '../hooks/useStageScale'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useFullscreen } from '../hooks/useFullscreen'
import { SlideNavigation } from './SlideNavigation'
import { ProgressIndicator } from './ProgressIndicator'
import { MotionPrefProvider } from './MotionPrefContext'
import { TransitionPresetProvider } from './TransitionPresetContext'
import { ViewportProvider } from './ViewportContext'
import { EASE_LUX, TRANSITIONS } from './motion'
import { portfolioCategories } from '../data/content'
const logo = "/capability-deck/famysys-logo.png";

// Selected Work's category tabs step through on next/prev before falling
// through to the adjacent slide. This state lives here (not inside
// SelectedWorkSlide, and not reached via a ref into it) because during a
// slide transition AnimatePresence keeps the outgoing slide's instance —
// and any ref pointed at it — fully mounted for the whole exit animation.
// A next/prev press landing in that window would silently mutate the
// departing instance's own state instead of navigating, and once that
// happens the interrupted exit never reports back as complete, so the old
// slide is never removed and just keeps stacking under every slide after
// it. Owning the tab index here sidesteps that entirely.
const SELECTED_WORK_TAB_COUNT = portfolioCategories.length

/**
 * `slides` is a fixed non-empty list and every index reaching this is clamped
 * into it by `goTo`, so the lookup is total. Named once so the call sites read
 * the way they did before noUncheckedIndexedAccess.
 */
function slideAt(slides: ReadonlyArray<SlideEntry>, index: number): SlideEntry {
  return slides[index] as SlideEntry
}

// Reduced-motion viewers still get the pointerEvents/opacity exit guard below
// (it's a correctness fix, not a motion flourish) but skip the staggered
// children and get a fast plain fade instead of the full-duration transition.
function wrapperVariants(reducedMotion: boolean): Variants {
  return {
    enter: {},
    center: {
      transition: reducedMotion ? { duration: 0.15 } : { staggerChildren: 0.02 },
    },
    // Force the whole outgoing slide invisible even if a nested Layer exit
    // stalls or AnimatePresence leaves the node mounted briefly. Transparent
    // stage + partial Layer opacity previously let Selected Work (Website tab)
    // bleed through Ways to Work / CTA as a stacked overlay.
    exit: {
      opacity: 0,
      // Opacity alone still leaves the exiting node in the hit-test tree —
      // it silently ate clicks on the live slide (tabs) while footer chrome
      // (z-index 20, outside the slide) kept working.
      pointerEvents: 'none',
      transition: reducedMotion
        ? { duration: 0.12 }
        : { duration: 0.35, ease: EASE_LUX, staggerChildren: 0.01, staggerDirection: -1 },
    },
  }
}

interface PresentationShellProps {
  readonly slides: ReadonlyArray<SlideEntry>
}

export function PresentationShell({ slides }: PresentationShellProps) {
  const [[index, direction], setState] = useState<[number, Direction]>([0, 0])
  const [selectedWorkTab, setSelectedWorkTab] = useState(0)
  const { scale, stageWidth, stageHeight, isMobile } = useStageScale()
  const reducedMotion = usePrefersReducedMotion()
  const viewportRef = useRef(null)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(viewportRef)

  // Guards against rapid repeated navigation (holding an arrow key, mashing
  // the nav button) flooding AnimatePresence with overlapping exit
  // animations — each click used to queue its own slide before the last one
  // had finished leaving, stacking several slides' content on screen at
  // once. A new navigation is ignored until the current one's exit
  // animation actually completes (onExitComplete below), with a timeout
  // fallback so a missed callback can never permanently lock navigation.
  const isAnimating = useRef(false)
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Bumped on every real slide change and folded into the AnimatePresence
  // key below. Revisiting the same slide id (e.g. Selected Work again via
  // Prev) must never reuse the exact key of a still-exiting instance of
  // itself — if it did, React/Framer Motion could treat the reappearing
  // slide as a continuation of the old one instead of a fresh entrance,
  // leaving the old exit's cleanup unresolved.
  const navSeq = useRef(0)
  // Remounts AnimatePresence when the unlock failsafe fires so orphaned
  // exiting nodes (e.g. Selected Work / Website) are discarded instead of
  // stacking under later slides after a missed onExitComplete.
  const [presenceEpoch, setPresenceEpoch] = useState(0)

  const unlock = useCallback(() => {
    isAnimating.current = false
    if (unlockTimer.current) {
      clearTimeout(unlockTimer.current)
      unlockTimer.current = null
    }
  }, [])

  const unlockWithRemount = useCallback(() => {
    setPresenceEpoch((e) => e + 1)
    unlock()
  }, [unlock])

  const goTo = useCallback(
    (next: number) => {
      if (isAnimating.current) return
      const clamped = Math.max(0, Math.min(slides.length - 1, next))
      if (clamped === index) return
      const dir = clamped > index ? 1 : -1
      // Land on the first tab when arriving from before, the last tab
      // when arriving from after, so cycling continues smoothly across
      // the slide boundary in either direction.
      if (slideAt(slides, clamped).id === 'selected-work') {
        setSelectedWorkTab(dir >= 0 ? 0 : SELECTED_WORK_TAB_COUNT - 1)
      }
      isAnimating.current = true
      // This failsafe exists only to recover from a truly missed
      // onExitComplete callback — it must never fire before a real
      // transition can finish, or it unlocks navigation while the old
      // slide is still mid-exit. A new click landing in that gap starts a
      // second transition on top of the first, and Framer Motion orphans
      // the interrupted exit instead of ever cleaning it up — it just
      // sits there under every slide that follows. The slowest preset
      // here (the section-label mask reveal) takes ~1.1s, so this needs
      // real headroom above that, not just above the visual duration.
      // Remount presence on timeout so any orphan is torn down; normal
      // unlock via onExitComplete does not remount.
      unlockTimer.current = setTimeout(unlockWithRemount, 2200)
      navSeq.current += 1
      setState([clamped, dir])
    },
    [index, slides, unlockWithRemount],
  )

  useEffect(() => () => {
    if (unlockTimer.current) clearTimeout(unlockTimer.current)
  }, [])

  const onNext = useCallback(() => {
    if (isMediaExpanded()) return
    if (slideAt(slides, index).id === 'selected-work' && selectedWorkTab < SELECTED_WORK_TAB_COUNT - 1) {
      setSelectedWorkTab((t) => t + 1)
      return
    }
    goTo(index + 1)
  }, [goTo, index, selectedWorkTab, slides])
  const onPrev = useCallback(() => {
    if (isMediaExpanded()) return
    if (slideAt(slides, index).id === 'selected-work' && selectedWorkTab > 0) {
      setSelectedWorkTab((t) => t - 1)
      return
    }
    goTo(index - 1)
  }, [goTo, index, selectedWorkTab, slides])
  const onFirst = useCallback(() => goTo(0), [goTo])
  const onLast = useCallback(() => goTo(slides.length - 1), [goTo, slides.length])

  useKeyboardNav({ onNext, onPrev, onFirst, onLast })
  const swipeHandlers = useSwipeNav({ onNext, onPrev })
  const { onWheel } = useWheelNav({ onNext, onPrev })
  const handleWheel = isMobile ? undefined : onWheel

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'f' || e.key === 'F') toggleFullscreen()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleFullscreen])

  const ActiveSlide = slideAt(slides, index).Component
  const presetIndex = Math.min(TRANSITIONS.length - 1, Math.max(0, direction >= 0 ? index - 1 : index))
  const preset = TRANSITIONS[presetIndex] as TransitionPreset

  return (
    <ViewportProvider isMobile={isMobile}>
      <div ref={viewportRef} style={styles.viewport}>
        <div
          style={{
            ...styles.stage,
            width: stageWidth,
            height: stageHeight,
            transform: isMobile ? 'none' : `scale(${scale})`,
            ...(isMobile
              ? {
                  width: '100%',
                  height: '100%',
                  maxWidth: '100vw',
                  maxHeight: '100dvh',
                }
              : null),
          }}
          {...swipeHandlers}
          onWheel={handleWheel}
        >
          <AnimatePresence key={presenceEpoch} custom={direction} initial={false} onExitComplete={unlock}>
            <motion.div
              key={`${slideAt(slides, index).id}-${navSeq.current}`}
              custom={direction}
              variants={wrapperVariants(reducedMotion)}
              initial="enter"
              animate="center"
              exit="exit"
              style={styles.slideWrap}
            >
              <MotionPrefProvider reduced={reducedMotion}>
                <TransitionPresetProvider preset={preset} direction={direction}>
                  <ActiveSlide
                    meta={{ index: index + 1, total: slides.length, title: slideAt(slides, index).title }}
                    active
                    activeTab={selectedWorkTab}
                    onActiveTabChange={setSelectedWorkTab}
                  />
                </TransitionPresetProvider>
              </MotionPrefProvider>
            </motion.div>
          </AnimatePresence>

          <div style={isMobile ? styles.chromeTopMobile : styles.chromeTop}>
            <img src={logo} alt="Famysys Studio" style={isMobile ? styles.logoMobile : styles.logo} />
          </div>

          <div style={isMobile ? styles.chromeBottomMobile : styles.chromeBottom}>
            <ProgressIndicator index={index} total={slides.length} onJump={goTo} compact={isMobile} />
            <div style={styles.chromeBottomRight}>
              {!isMobile && (
                <motion.button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
                  style={styles.fullscreenBtn}
                  whileHover={{ scale: 1.08, borderColor: 'var(--color-cream-faint)', color: 'var(--color-cream)' }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ duration: 0.18, ease: EASE_LUX }}
                >
                  {isFullscreen ? <Minimize size={16} strokeWidth={1.5} /> : <Maximize size={16} strokeWidth={1.5} />}
                </motion.button>
              )}
              <SlideNavigation
                onPrev={onPrev}
                onNext={onNext}
                canPrev={
                  index > 0 || (slideAt(slides, index).id === 'selected-work' && selectedWorkTab > 0)
                }
                canNext={
                  index < slides.length - 1 ||
                  (slideAt(slides, index).id === 'selected-work' && selectedWorkTab < SELECTED_WORK_TAB_COUNT - 1)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </ViewportProvider>
  )
}

const styles = {
  viewport: {
    width: '100vw',
    height: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg-outer)',
    overflow: 'hidden',
  },
  stage: {
    position: 'relative',
    background: 'var(--color-bg)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  slideWrap: {
    position: 'absolute',
    inset: 0,
  },
  chromeTop: {
    position: 'absolute',
    top: '56px',
    left: '116px',
    zIndex: 20,
    pointerEvents: 'none',
  },
  logo: {
    height: '51px',
    width: 'auto',
    opacity: 0.92,
  },
  logoMobile: {
    height: '28px',
    width: 'auto',
    opacity: 0.92,
  },
  chromeBottom: {
    position: 'absolute',
    bottom: '52px',
    left: '116px',
    right: '116px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  chromeBottomMobile: {
    position: 'absolute',
    bottom: 'max(16px, env(safe-area-inset-bottom))',
    left: '16px',
    right: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    zIndex: 20,
  },
  chromeTopMobile: {
    position: 'absolute',
    top: 'max(14px, env(safe-area-inset-top))',
    left: '16px',
    zIndex: 20,
    pointerEvents: 'none',
  },
  chromeBottomRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  fullscreenBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '999px',
    border: '1px solid var(--color-ink-line)',
    color: 'var(--color-cream-dim)',
    transition: 'border-color 0.25s ease, color 0.25s ease',
  },
} satisfies Record<string, CSSProperties>
