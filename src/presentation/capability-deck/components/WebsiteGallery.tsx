import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { WheelEvent as ReactWheelEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { setMediaExpanded } from '../hooks/mediaExpandLock'
import { usePortalTarget } from '../hooks/usePortalTarget'
import { useIsMobile } from './ViewportContext'
import { EASE_LUX } from './motion'
import type { GalleryProject, MediaRatio } from '../types'

const DEFAULT_CARD_HEIGHT = 545
const ANGLE_DESKTOP = 30
const ANGLE_MOBILE = 14
const MAX_VISIBLE_OFFSET = 4
const MAX_VISIBLE_OFFSET_MOBILE = 2
const EDGE_PADDING = 4
const WHEEL_COOLDOWN_MS = 550

function cardWidth(ratio: MediaRatio, cardHeight: number): number {
  if (ratio === 'portrait') return cardHeight * (9 / 16)
  if (ratio === 'square') return cardHeight
  return cardHeight * (16 / 9)
}

function stageAspect(ratio: MediaRatio): string {
  if (ratio === 'portrait') return '9 / 16'
  if (ratio === 'square') return '1 / 1'
  return '16 / 9'
}

function dialogWidth(ratio: MediaRatio, isMobile: boolean): string {
  if (isMobile) return 'min(100%, calc(100vw - 24px))'
  if (ratio === 'portrait') return 'min(520px, 90vw)'
  if (ratio === 'square') return 'min(780px, 88vw)'
  return 'min(1280px, 92vw)'
}

function canExpand(project: GalleryProject): boolean {
  return Boolean(project?.image || project?.previewUrl)
}

interface ExpandModalProps {
  readonly project: GalleryProject
  readonly ratio: MediaRatio
  readonly index: number
  readonly total: number
  readonly canPrev: boolean
  readonly canNext: boolean
  readonly onPrev: () => void
  readonly onNext: () => void
  readonly onClose: () => void
  readonly isMobile: boolean
}

function ExpandModal({ project, ratio, index, total, canPrev, canNext, onPrev, onNext, onClose, isMobile }: ExpandModalProps) {
  const wheelLockRef = useRef(false)
  const onPrevRef = useRef(onPrev)
  const onNextRef = useRef(onNext)
  const canPrevRef = useRef(canPrev)
  const canNextRef = useRef(canNext)

  useEffect(() => {
    onPrevRef.current = onPrev
    onNextRef.current = onNext
    canPrevRef.current = canPrev
    canNextRef.current = canNext
  }, [onPrev, onNext, canPrev, canNext])

  useEffect(() => {
    setMediaExpanded(true)
    return () => setMediaExpanded(false)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        if (canPrevRef.current) onPrevRef.current()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        if (canNextRef.current) onNextRef.current()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const isPortrait = ratio === 'portrait'
  const isSquare = ratio === 'square'

  function onModalWheel(e: ReactWheelEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return
    if (wheelLockRef.current) return
    wheelLockRef.current = true
    window.setTimeout(() => {
      wheelLockRef.current = false
    }, WHEEL_COOLDOWN_MS)
    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
    if (delta > 0) {
      if (canNextRef.current) onNextRef.current()
    } else if (canPrevRef.current) {
      onPrevRef.current()
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_LUX }}
      style={{
        ...styles.modalBackdrop,
        padding: isMobile ? 'max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom))' : '24px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      onWheel={onModalWheel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE_LUX }}
        style={{
          ...styles.modalDialog,
          width: dialogWidth(ratio, isMobile),
          maxHeight: isMobile ? 'min(900px, 92dvh)' : 'min(900px, 90vh)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalChrome}>
          <div style={styles.modalMeta}>
            <span style={styles.counter}>
              {index + 1} / {total}
            </span>
            <span style={styles.modalTitle}>{project.title}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            style={styles.modalClose}
            aria-label="Close expanded view"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div
          style={{
            ...styles.modalStage,
            aspectRatio: stageAspect(ratio),
            maxHeight: isMobile
              ? 'min(70dvh, 560px)'
              : isPortrait
                ? 'min(780px, 78vh)'
                : isSquare
                  ? 'min(720px, 78vh)'
                  : 'min(680px, 76vh)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={project.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={styles.modalMedia}
            >
              {project.image ? (
                <img src={project.image} alt={project.title} style={styles.modalImage} />
              ) : project.previewUrl ? (
                <iframe
                  src={project.previewUrl}
                  title={`${project.title} expanded preview`}
                  style={styles.modalIframe}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </motion.div>
          </AnimatePresence>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            disabled={!canPrev}
            style={{ ...styles.modalNavBtn, ...styles.modalNavPrev, opacity: canPrev ? 1 : 0.25 }}
            aria-label="Previous media"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onNext()
            }}
            disabled={!canNext}
            style={{ ...styles.modalNavBtn, ...styles.modalNavNext, opacity: canNext ? 1 : 0.25 }}
            aria-label="Next media"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </div>

        <p style={styles.modalHint}>← → next · Esc to close</p>
      </motion.div>
    </motion.div>
  )
}

/**
 * Coverflow gallery for website previews and print images, with the same
 * Expand pattern as VideoGallery (controls button + double-click).
 */
interface WebsiteGalleryProps {
  readonly projects: ReadonlyArray<GalleryProject> | undefined
  readonly defaultRatio?: MediaRatio
  readonly cardHeight?: number
  readonly onActiveChange?: ((index: number) => void) | undefined
}

export function WebsiteGallery({ projects, defaultRatio = 'landscape', cardHeight = DEFAULT_CARD_HEIGHT, onActiveChange }: WebsiteGalleryProps) {
  const isMobile = useIsMobile()
  const portalTarget = usePortalTarget()
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const activeRef = useRef(0)
  const wheelLockRef = useRef(false)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const ANGLE = isMobile ? ANGLE_MOBILE : ANGLE_DESKTOP
  const visibleOffset = isMobile ? MAX_VISIBLE_OFFSET_MOBILE : MAX_VISIBLE_OFFSET
  const STEP = cardHeight * (isMobile ? 0.38 : 215 / 485)

  useEffect(() => {
    activeRef.current = active
    onActiveChange?.(active)
  }, [active, onActiveChange])

  // Only reset when the list identity changes — parent often passes a fresh
  // array reference on every render (e.g. mapped print images).
  const projectsId = projects?.map((p: GalleryProject) => p.key).join('|') ?? ''

  useEffect(() => {
    setActive(0)
    setExpanded(false)
  }, [projectsId])

  useEffect(() => {
    const candidate = projects?.[active]
    if (expanded && candidate && !canExpand(candidate)) {
      setExpanded(false)
    }
  }, [active, expanded, projects])

  function go(next: number | ((current: number) => number)) {
    setActive((current) => {
      const target = typeof next === 'function' ? next(current) : next
      return Math.max(0, Math.min((projects?.length ?? 1) - 1, target))
    })
  }

  function goPrev() {
    go((current: number) => current - 1)
  }

  function goNext() {
    go((current: number) => current + 1)
  }

  function onStageWheel(e: WheelEvent) {
    if (expanded) return false
    if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return false

    e.preventDefault()
    e.stopPropagation()

    if (wheelLockRef.current) return true
    wheelLockRef.current = true
    window.setTimeout(() => {
      wheelLockRef.current = false
    }, WHEEL_COOLDOWN_MS)

    const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
    go(activeRef.current + (delta > 0 ? 1 : -1))
    return true
  }

  useEffect(() => {
    const node = stageRef.current
    if (!node) return undefined

    const onWheel = (e: WheelEvent) => {
      onStageWheel(e)
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [projects?.length, expanded, cardHeight])

  function onCardClick(i: number, project: GalleryProject) {
    if (i !== active) {
      go(i)
      return
    }
    const href = project.liveUrl || project.previewUrl || project.url
    if (!href || href === '#') return
    // Print images have no useful external link — expand instead of opening "#".
    if (!project.liveUrl && !project.previewUrl && project.image) {
      setExpanded(true)
      return
    }
    window.open(href, '_blank', 'noopener,noreferrer')
  }

  if (!projects || projects.length === 0) return null

  // `active` is clamped into range by go(), and the list is non-empty past the
  // guard above, so this lookup is total.
  const activeProject = projects[active] as GalleryProject
  const activeRatio = activeProject.ratio || defaultRatio
  const activeWidth = cardWidth(activeRatio, cardHeight)
  const leftAnchor = EDGE_PADDING + activeWidth / 2
  const showExpand = canExpand(activeProject)

  return (
    <div
      style={styles.root}
      onWheel={(e) => {
        // Keep print/web gallery wheel inside this component — never scroll the slide.
        if (!expanded) {
          e.stopPropagation()
        }
      }}
    >
      <div ref={stageRef} style={{ ...styles.stage, height: `${cardHeight}px` }}>
        {projects.map((project, i) => {
          const offset = i - active
          const absOffset = Math.abs(offset)
          if (absOffset > visibleOffset) return null

          const ratio = project.ratio || defaultRatio
          const width = cardWidth(ratio, cardHeight)
          const isActive = offset === 0
          const previewScale = width / 1280

          return (
            <motion.button
              key={project.key}
              type="button"
              onClick={() => onCardClick(i, project)}
              onDoubleClick={(e) => {
                e.preventDefault()
                if (isActive && canExpand(project)) setExpanded(true)
              }}
              aria-label={project.title}
              aria-current={isActive}
              style={{
                ...styles.card,
                width,
                height: cardHeight,
                left: leftAnchor,
                marginLeft: -width / 2,
                zIndex: 100 - absOffset,
                cursor: isActive && (project.liveUrl || project.previewUrl || project.url || project.image) ? 'pointer' : isActive ? 'default' : 'pointer',
              }}
              animate={{
                x: offset * STEP,
                rotateY: offset * -ANGLE,
                z: isActive ? 40 : -absOffset * 130,
                scale: Math.max(0.62, 1 - absOffset * 0.13),
                opacity: Math.max(0.18, 1 - absOffset * 0.24),
              }}
              transition={{ duration: 0.55, ease: EASE_LUX }}
            >
              {project.previewUrl ? (
                <div style={styles.previewFrame} aria-hidden={!isActive}>
                  {isActive && !expanded && (
                    <iframe
                      src={project.previewUrl}
                      title={`${project.title} live preview`}
                      style={{
                        ...styles.previewIframe,
                        transform: `scale(${previewScale})`,
                      }}
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      referrerPolicy="no-referrer"
                      tabIndex={-1}
                    />
                  )}
                  {(!isActive || expanded) && (
                    <div style={styles.previewIdle}>
                      <span style={styles.placeholderText}>{project.title}</span>
                    </div>
                  )}
                </div>
              ) : project.image ? (
                <img src={project.image} alt={project.title} style={styles.image} loading="lazy" />
              ) : (
                <div style={styles.placeholder}>
                  <span style={styles.placeholderText}>Image to be added</span>
                </div>
              )}
              <div style={styles.reflection} />
            </motion.button>
          )
        })}
      </div>

      <div
        style={{
          ...styles.controls,
          width: '100%',
          maxWidth: '100%',
          marginLeft: EDGE_PADDING,
        }}
      >
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} style={{ ...styles.arrowBtn, opacity: active === 0 ? 0.3 : 1 }} aria-label="Previous project">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>

        <span style={styles.counterBadge} aria-live="polite">
          {active + 1} / {projects.length}
        </span>

        <button
          type="button"
          onClick={() => go(active + 1)}
          disabled={active === projects.length - 1}
          style={{ ...styles.arrowBtn, opacity: active === projects.length - 1 ? 0.3 : 1 }}
          aria-label="Next project"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>

        {projects.length <= 10 && (
          <div style={styles.dots}>
            {projects.map((p, i) => (
              <button key={p.key} type="button" onClick={() => go(i)} aria-label={`Go to ${p.title}`} style={styles.dotBtn}>
                <span style={{ ...styles.dot, background: i === active ? 'var(--color-accent-on-dark)' : 'var(--color-ink-line)' }} />
              </button>
            ))}
          </div>
        )}

        {showExpand && (
          <button type="button" onClick={() => setExpanded(true)} style={styles.expandControl} aria-label="Expand image">
            <Maximize2 size={15} strokeWidth={1.5} />
            {!isMobile && 'Expand'}
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.span
            key={activeProject.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.caption}
          >
            {activeProject.title}
          </motion.span>
        </AnimatePresence>
      </div>

      {createPortal(
        <AnimatePresence>
          {expanded && showExpand ? (
            <ExpandModal
              key="print-expand-modal"
              project={activeProject}
              ratio={activeRatio}
              index={active}
              total={projects.length}
              canPrev={active > 0}
              canNext={active < projects.length - 1}
              onPrev={goPrev}
              onNext={goNext}
              onClose={() => setExpanded(false)}
              isMobile={isMobile}
            />
          ) : null}
        </AnimatePresence>,
        portalTarget,
      )}
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: '100%',
    justifyContent: 'flex-start',
    gap: '22px',
  },
  stage: {
    position: 'relative',
    width: '100%',
    perspective: '1600px',
    flexShrink: 0,
  },
  card: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
    border: '1px solid var(--color-ink-line)',
    background: 'var(--color-ink-raised)',
    transformStyle: 'preserve-3d',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
    background: 'var(--color-ink-raised)',
    padding: '6px',
    boxSizing: 'border-box',
  },
  previewFrame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: 'var(--color-ink-raised)',
    pointerEvents: 'none',
  },
  previewIframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '1280px',
    height: '900px',
    border: 'none',
    transformOrigin: 'top left',
    background: 'var(--deck-preview-paper)',
  },
  previewIdle: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-cream-ghost)',
  },
  reflection: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, transparent 65%, var(--deck-scrim-ground-50) 100%)',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    minWidth: 0,
    flexWrap: 'nowrap',
  },
  arrowBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    border: '1px solid var(--color-ink-line)',
    color: 'var(--color-cream)',
    flexShrink: 0,
  },
  expandControl: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minWidth: '36px',
    height: '36px',
    padding: '0 12px',
    borderRadius: '999px',
    border: '1px solid var(--color-ink-line)',
    color: 'var(--color-cream)',
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    flexShrink: 0,
    cursor: 'pointer',
    background: 'transparent',
  },
  dots: {
    display: 'flex',
    gap: '7px',
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  dotBtn: {
    padding: '6px 2px',
    flexShrink: 0,
  },
  dot: {
    display: 'block',
    width: '7px',
    height: '7px',
    borderRadius: '999px',
  },
  caption: {
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--color-cream-dim)',
    marginLeft: '4px',
    paddingLeft: '14px',
    borderLeft: '1px solid var(--color-ink-line)',
    minWidth: 0,
    maxWidth: '280px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: '1 1 auto',
  },
  counterBadge: {
    flexShrink: 0,
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    letterSpacing: '0.06em',
    color: 'var(--color-cream)',
    minWidth: '3.5em',
    textAlign: 'center',
  },
  counter: {
    flexShrink: 0,
    fontSize: '13px',
    letterSpacing: '0.06em',
    color: 'var(--color-cream-faint)',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--deck-scrim-ground-82)',
    backdropFilter: 'blur(6px)',
  },
  modalDialog: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxWidth: '100%',
  },
  modalChrome: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  modalMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },
  modalTitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--color-cream)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  modalClose: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '999px',
    border: '1px solid var(--color-ink-line)',
    color: 'var(--color-cream)',
    background: 'var(--deck-scrim-alt-90)',
    flexShrink: 0,
    cursor: 'pointer',
  },
  modalStageWrap: {
    position: 'relative',
    width: '100%',
  },
  modalNavBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '999px',
    border: '1px solid var(--color-ink-line)',
    color: 'var(--color-cream)',
    background: 'var(--deck-scrim-alt-92)',
    cursor: 'pointer',
  },
  modalNavPrev: {
    left: '12px',
  },
  modalNavNext: {
    right: '12px',
  },
  modalStage: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    border: '1px solid var(--color-ink-line)',
    background: 'var(--color-ink-raised)',
  },
  modalMedia: {
    width: '100%',
    height: '100%',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
    background: 'var(--color-ink-raised)',
    padding: '8px',
    boxSizing: 'border-box',
  },
  modalIframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
    background: 'var(--deck-preview-paper)',
  },
  modalHint: {
    margin: 0,
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    letterSpacing: '0.04em',
    color: 'var(--color-cream-faint)',
  },
} satisfies Record<string, CSSProperties>
