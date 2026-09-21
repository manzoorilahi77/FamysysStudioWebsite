import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { WheelEvent as ReactWheelEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ExternalLink, Maximize2, Play, Volume2, VolumeX, X } from 'lucide-react'
import { setMediaExpanded } from '../hooks/mediaExpandLock'
import { usePortalTarget } from '../hooks/usePortalTarget'
import { useIsMobile } from './ViewportContext'
import { EASE_LUX } from './motion'
import type { DeckVideo, MediaRatio } from '../types'

/** Drive's own player, or a direct stream through a <video> element. */
type PlayerMode = 'stream' | 'iframe'

const DEFAULT_CARD_HEIGHT = 545
const ANGLE_DESKTOP = 30
const ANGLE_MOBILE = 14
const MAX_VISIBLE_OFFSET = 4
const MAX_VISIBLE_OFFSET_MOBILE = 2
const EDGE_PADDING = 4
const WHEEL_COOLDOWN_MS = 550

function cardWidth(ratio: MediaRatio, cardHeight: number): number {
  return ratio === 'portrait' ? cardHeight * (9 / 16) : cardHeight * (16 / 9)
}

function driveFileId(src: string): string | null {
  if (!src) return null
  const fileMatch = src.match(/\/file\/d\/([^/?#]+)/)
  if (fileMatch?.[1]) return fileMatch[1]
  const openMatch = src.match(/[?&]id=([^&]+)/)
  return openMatch?.[1] ?? null
}

function drivePreviewSrc(src: string): string {
  const id = driveFileId(src)
  if (!id) return src
  return `https://drive.google.com/file/d/${id}/preview`
}

function driveViewSrc(src: string): string {
  const id = driveFileId(src)
  if (!id) return src
  return `https://drive.google.com/file/d/${id}/view`
}

function driveStreamCandidates(fileId: string | null): ReadonlyArray<string> {
  if (!fileId) return []
  return [
    `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`,
    `https://docs.google.com/uc?export=download&id=${fileId}`,
  ]
}

function driveThumbSrc(src: string): string | null {
  const id = driveFileId(src)
  if (!id) return null
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1280`
}

/**
 * Mobile playback: Drive’s /preview embed often shows “Can’t stream this clip
 * here” on phones, so we never mount that iframe. Tap opens the native Drive
 * viewer in a new tab — the reliable path for shared clips.
 */
interface MobileDrivePlayerProps {
  readonly src: string
  readonly title: string
}

function MobileDrivePlayer({ src, title }: MobileDrivePlayerProps) {
  const viewUrl = driveViewSrc(src)
  const thumb = driveThumbSrc(src)

  return (
    <a
      href={viewUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-media-player="true"
      style={styles.mobilePlayCard}
      aria-label={`Play ${title} in Google Drive`}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {thumb ? (
        <img src={thumb} alt="" style={styles.mobilePlayThumb} loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <div style={styles.mobilePlayFallbackBg} />
      )}
      <span style={styles.mobilePlayScrim} aria-hidden />
      <span style={styles.mobilePlayBadge}>
        <Play size={28} fill="currentColor" strokeWidth={0} />
      </span>
      <span style={styles.mobilePlayCaption}>
        Play video
        <ExternalLink size={12} strokeWidth={1.75} />
      </span>
    </a>
  )
}

/**
 * Desktop Drive clip: muted autoplay via native <video>, iframe fallback.
 */
interface ActiveDrivePlayerProps {
  readonly src: string
  readonly title: string
  readonly soundOn: boolean
  readonly onToggleSound: () => void
  readonly expanded?: boolean
}

function ActiveDrivePlayer({ src, title, soundOn, onToggleSound, expanded = false }: ActiveDrivePlayerProps) {
  const fileId = driveFileId(src)
  const candidates = driveStreamCandidates(fileId)
  const thumb = driveThumbSrc(src)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [mode, setMode] = useState<PlayerMode>(fileId ? 'stream' : 'iframe')
  const [paused, setPaused] = useState(false)
  const [streamIndex, setStreamIndex] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setMode(fileId ? 'stream' : 'iframe')
    setPaused(false)
    setStreamIndex(0)
    setReady(false)
  }, [src, fileId])

  useEffect(() => {
    setReady(false)
  }, [mode])

  useEffect(() => {
    const el = videoRef.current
    if (!el || mode !== 'stream') return
    el.muted = !soundOn
    if (!paused) {
      el.play().catch(() => {})
    }
  }, [soundOn, paused, mode, src, streamIndex])

  useEffect(() => {
    if (mode !== 'stream') return undefined
    const timer = window.setTimeout(() => {
      const el = videoRef.current
      if (!el || el.readyState < 2 || el.paused) {
        setMode('iframe')
      }
    }, 1400)
    return () => window.clearTimeout(timer)
  }, [mode, src, streamIndex])

  function tryPlay(el: HTMLVideoElement | null) {
    if (!el) return
    el.muted = !soundOn
    el.play().catch(() => setMode('iframe'))
  }

  if (mode === 'iframe' || !fileId) {
    return (
      <div style={styles.playerWrap}>
        {thumb && <img src={thumb} alt="" style={styles.playerThumb} loading="eager" referrerPolicy="no-referrer" />}
        <iframe
          key={`${drivePreviewSrc(src)}-${expanded ? 'lg' : 'sm'}`}
          style={{ ...styles.frame, opacity: ready ? 1 : 0 }}
          src={drivePreviewSrc(src)}
          title={title}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setReady(true)}
        />
      </div>
    )
  }

  return (
    <div style={styles.playerWrap}>
      {thumb && <img src={thumb} alt="" style={styles.playerThumb} loading="eager" referrerPolicy="no-referrer" />}
      <video
        key={`${fileId}-${streamIndex}-${expanded ? 'lg' : 'sm'}`}
        ref={videoRef}
        style={{ ...styles.video, opacity: ready ? 1 : 0 }}
        src={candidates[streamIndex]}
        poster={thumb ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        onLoadedData={(e) => {
          tryPlay(e.currentTarget)
          setReady(true)
        }}
        onCanPlay={(e) => {
          tryPlay(e.currentTarget)
          setReady(true)
        }}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onError={() => {
          if (streamIndex < candidates.length - 1) setStreamIndex((i) => i + 1)
          else setMode('iframe')
        }}
        onClick={(e) => {
          e.stopPropagation()
          const el = e.currentTarget
          if (el.paused) {
            el.play().catch(() => setMode('iframe'))
          } else {
            el.pause()
          }
        }}
      />
      <button
        type="button"
        style={{ ...styles.soundBtn, ...(expanded ? styles.soundBtnExpanded : null) }}
        onClick={(e) => {
          e.stopPropagation()
          onToggleSound()
        }}
        aria-label={soundOn ? 'Mute video' : 'Unmute video'}
      >
        {soundOn ? <Volume2 size={14} strokeWidth={1.75} /> : <VolumeX size={14} strokeWidth={1.75} />}
        {soundOn ? 'Sound on' : 'Click for sound'}
      </button>
    </div>
  )
}

interface ExpandModalProps {
  readonly video: DeckVideo
  readonly ratio: MediaRatio
  readonly index: number
  readonly total: number
  readonly soundOn: boolean
  readonly onToggleSound: () => void
  readonly canPrev: boolean
  readonly canNext: boolean
  readonly onPrev: () => void
  readonly onNext: () => void
  readonly onClose: () => void
  readonly isMobile: boolean
}

function ExpandModal({ video, ratio, index, total, soundOn, onToggleSound, canPrev, canNext, onPrev, onNext, onClose, isMobile }: ExpandModalProps) {
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

  function onModalWheel(e: ReactWheelEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return
    if (wheelLockRef.current) return
    wheelLockRef.current = true
    window.setTimeout(() => {
      wheelLockRef.current = false
    }, WHEEL_COOLDOWN_MS)
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
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
      aria-label={video.title}
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
          width: isMobile ? 'min(100%, calc(100vw - 24px))' : isPortrait ? 'min(420px, 88vw)' : 'min(1280px, 92vw)',
          maxHeight: isMobile ? 'min(900px, 92dvh)' : 'min(860px, 88vh)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalChrome}>
          <div style={styles.modalMeta}>
            <span style={styles.counter}>
              {index + 1} / {total}
            </span>
            <span style={styles.modalTitle}>{video.title}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            style={styles.modalClose}
            aria-label="Close expanded video"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div
          style={{
            ...styles.modalStage,
            aspectRatio: isPortrait ? '9 / 16' : '16 / 9',
            maxHeight: isMobile
              ? 'min(70dvh, 560px)'
              : isPortrait
                ? 'min(760px, 78vh)'
                : 'min(680px, 76vh)',
          }}
        >
          {isMobile ? (
            <MobileDrivePlayer key={drivePreviewSrc(video.src)} src={video.src} title={video.title} />
          ) : (
            <ActiveDrivePlayer
              key={drivePreviewSrc(video.src)}
              src={video.src}
              title={video.title}
              soundOn={soundOn}
              onToggleSound={onToggleSound}
              expanded
            />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPrev()
            }}
            disabled={!canPrev}
            style={{ ...styles.modalNavBtn, ...styles.modalNavPrev, opacity: canPrev ? 1 : 0.25 }}
            aria-label="Previous video"
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
            aria-label="Next video"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </div>

        {isMobile && (
          <a
            href={driveViewSrc(video.src)}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.mobileOpenLinkBtn}
            onClick={(e) => e.stopPropagation()}
          >
            <Play size={14} fill="currentColor" strokeWidth={0} />
            Play in Google Drive
            <ExternalLink size={12} strokeWidth={1.75} />
          </a>
        )}

        <p style={styles.modalHint}>
          {isMobile ? 'Opens in Google Drive · swipe or use arrows for next · Esc to close' : '← → next video · Esc to close · click video to pause'}
        </p>
      </motion.div>
    </motion.div>
  )
}

/**
 * Coverflow video gallery with optional expanded player. Expand via the
 * control button or double-click on the active card; Esc / backdrop closes.
 */
interface VideoGalleryProps {
  readonly videos: ReadonlyArray<DeckVideo> | undefined
  readonly defaultRatio?: MediaRatio
  readonly cardHeight?: number
}

export function VideoGallery({ videos, defaultRatio = 'landscape', cardHeight = DEFAULT_CARD_HEIGHT }: VideoGalleryProps) {
  const isMobile = useIsMobile()
  const portalTarget = usePortalTarget()
  const [active, setActive] = useState(0)
  const [soundOn, setSoundOn] = useState(false)
  const [expanded, setExpanded] = useState(false)
  // Stays true through the expand exit animation so the card player does not
  // remount (and double-play) while the modal is still audible.
  const [modalOpen, setModalOpen] = useState(false)
  const activeRef = useRef(0)
  const wheelLockRef = useRef(false)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const ANGLE = isMobile ? ANGLE_MOBILE : ANGLE_DESKTOP
  const visibleOffset = isMobile ? MAX_VISIBLE_OFFSET_MOBILE : MAX_VISIBLE_OFFSET
  const STEP = cardHeight * (isMobile ? 0.38 : 215 / 485)

  useEffect(() => {
    activeRef.current = active
    setSoundOn(false)
  }, [active])

  useEffect(() => {
    if (expanded) setModalOpen(true)
  }, [expanded])

  const videosId = videos?.map((v) => v.src).join('|') ?? ''

  useEffect(() => {
    setActive(0)
    setSoundOn(false)
    setExpanded(false)
    setModalOpen(false)
  }, [videosId])

  function go(next: number | ((current: number) => number)) {
    setActive((current: number) => {
      const target = typeof next === 'function' ? next(current) : next
      return Math.max(0, Math.min((videos?.length ?? 1) - 1, target))
    })
  }

  function goPrev() {
    go((current: number) => current - 1)
  }

  function goNext() {
    go((current: number) => current + 1)
  }

  function stepFromWheel(e: WheelEvent) {
    if (expanded) return false
    if (Math.abs(e.deltaY) < 8 && Math.abs(e.deltaX) < 8) return false

    e.preventDefault()
    e.stopPropagation()

    if (wheelLockRef.current) return true
    wheelLockRef.current = true
    window.setTimeout(() => {
      wheelLockRef.current = false
    }, WHEEL_COOLDOWN_MS)

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    go(activeRef.current + (delta > 0 ? 1 : -1))
    return true
  }

  useEffect(() => {
    const node = stageRef.current
    if (!node) return undefined

    const onWheel = (e: WheelEvent) => {
      stepFromWheel(e)
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [videos?.length, expanded])

  function onCardClick(i: number) {
    if (i !== active) go(i)
  }

  if (!videos || videos.length === 0) return null

  // `active` is clamped into range by go(), and the list is non-empty past the
  // guard above, so this lookup is total.
  const activeVideo = videos[active] as DeckVideo
  const activeRatio = activeVideo.ratio || defaultRatio
  const activeWidth = cardWidth(activeRatio, cardHeight)
  const leftAnchor = EDGE_PADDING + activeWidth / 2
  const mobileMaxW =
    typeof window !== 'undefined' ? Math.max(240, window.innerWidth - 32) : activeWidth
  const mobileFrameW = Math.min(activeWidth, mobileMaxW)
  const mobileFrameH =
    activeRatio === 'portrait' ? mobileFrameW * (16 / 9) : mobileFrameW * (9 / 16)

  return (
    <div style={styles.root}>
      {isMobile ? (
        <div style={styles.mobileBlock}>
          <div
            data-media-player="true"
            style={{
              ...styles.mobileStage,
              width: mobileFrameW,
              height: Math.min(mobileFrameH, cardHeight + 24),
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <MobileDrivePlayer key={drivePreviewSrc(activeVideo.src)} src={activeVideo.src} title={activeVideo.title} />
          </div>
          <div style={{ ...styles.mobileActionBar, width: mobileFrameW }} data-media-player="true">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(true)
              }}
              style={styles.mobileExpandLinkBtn}
              aria-label="Expand video"
            >
              <Maximize2 size={14} strokeWidth={1.75} />
              Expand
            </button>
          </div>
        </div>
      ) : (
        <div ref={stageRef} style={{ ...styles.stage, height: `${cardHeight}px` }}>
          {videos.map((video, i) => {
            const offset = i - active
            const absOffset = Math.abs(offset)
            if (absOffset > visibleOffset) return null

            const ratio = video.ratio || defaultRatio
            const width = cardWidth(ratio, cardHeight)
            const isActive = offset === 0

            return (
              <motion.div
                key={drivePreviewSrc(video.src)}
                role="group"
                aria-label={video.title}
                aria-current={isActive}
                onClick={() => onCardClick(i)}
                onDoubleClick={() => {
                  if (isActive) setExpanded(true)
                }}
                style={{
                  ...styles.card,
                  width,
                  height: cardHeight,
                  left: leftAnchor,
                  marginLeft: -width / 2,
                  zIndex: 100 - absOffset,
                  cursor: isActive ? 'default' : 'pointer',
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
                {isActive && !modalOpen ? (
                  <ActiveDrivePlayer
                    src={video.src}
                    title={video.title}
                    soundOn={soundOn}
                    onToggleSound={() => setSoundOn((v) => !v)}
                  />
                ) : (
                  <div style={styles.placeholder}>
                    {driveThumbSrc(video.src) && (
                      <img
                        src={driveThumbSrc(video.src) as string}
                        alt=""
                        style={styles.placeholderThumb}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <span style={styles.playBadge}>
                      <Play size={12} fill="currentColor" strokeWidth={0} />
                    </span>
                  </div>
                )}
                <div style={styles.reflection} />
              </motion.div>
            )
          })}
        </div>
      )}

      <div
        style={{
          ...styles.controls,
          width: '100%',
          maxWidth: '100%',
          marginLeft: EDGE_PADDING,
          gap: isMobile ? '8px' : '12px',
        }}
      >
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} style={{ ...styles.arrowBtn, opacity: active === 0 ? 0.3 : 1 }} aria-label="Previous video">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </button>

        <span style={styles.counterBadge} aria-live="polite">
          {active + 1} / {videos.length}
        </span>

        <button
          type="button"
          onClick={() => go(active + 1)}
          disabled={active === videos.length - 1}
          style={{ ...styles.arrowBtn, opacity: active === videos.length - 1 ? 0.3 : 1 }}
          aria-label="Next video"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>

        {videos.length <= 10 && (
          <div style={styles.dots}>
            {videos.map((v, i) => (
              <button key={drivePreviewSrc(v.src)} type="button" onClick={() => go(i)} aria-label={`Go to ${v.title}`} style={styles.dotBtn}>
                <span style={{ ...styles.dot, background: i === active ? 'var(--color-accent-on-dark)' : 'var(--color-ink-line)' }} />
              </button>
            ))}
          </div>
        )}

        <button type="button" onClick={() => setExpanded(true)} style={styles.expandControl} aria-label="Expand video">
          <Maximize2 size={15} strokeWidth={1.5} />
          {!isMobile && 'Expand'}
        </button>

        <AnimatePresence mode="wait">
          <motion.span
            key={activeVideo.title}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.caption}
          >
            {activeVideo.title}
          </motion.span>
        </AnimatePresence>
      </div>

      {createPortal(
        <AnimatePresence onExitComplete={() => setModalOpen(false)}>
          {expanded ? (
            <ExpandModal
              key="video-expand-modal"
              video={activeVideo}
              ratio={activeRatio}
              index={active}
              total={videos.length}
              soundOn={soundOn}
              onToggleSound={() => setSoundOn((v) => !v)}
              canPrev={active > 0}
              canNext={active < videos.length - 1}
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
  mobileStage: {
    position: 'relative',
    flexShrink: 0,
    maxWidth: '100%',
    border: '1px solid var(--color-ink-line)',
    background: 'var(--color-ink-raised)',
    overflow: 'hidden',
    transform: 'none',
  },
  mobileBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px',
    width: '100%',
    maxWidth: '100%',
  },
  mobileActionBar: {
    display: 'flex',
    gap: '8px',
    maxWidth: '100%',
  },
  mobilePlayCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    textDecoration: 'none',
    color: 'var(--color-cream)',
    background: 'var(--color-bg-outer)',
    overflow: 'hidden',
    WebkitTapHighlightColor: 'transparent',
  },
  mobilePlayThumb: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.72,
  },
  mobilePlayFallbackBg: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(160deg, var(--deck-video-gradient-top) 0%, var(--color-bg-outer) 55%, var(--color-ink-raised) 100%)',
  },
  mobilePlayScrim: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, var(--deck-scrim-ground-20) 0%, var(--deck-scrim-ground-72) 100%)',
  },
  mobilePlayBadge: {
    position: 'relative',
    zIndex: 1,
    width: '68px',
    height: '68px',
    borderRadius: '999px',
    background: 'var(--color-cream)',
    color: 'var(--color-ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '4px',
    boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
  },
  mobilePlayCaption: {
    position: 'relative',
    zIndex: 1,
    marginTop: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-cream)',
  },
  mobileOpenLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: '42px',
    marginTop: '10px',
    padding: '0 16px',
    borderRadius: '999px',
    border: '1px solid var(--color-ink-line)',
    background: 'var(--color-cream)',
    color: 'var(--color-ink)',
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent',
  },
  mobileExpandLinkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: '42px',
    padding: '0 14px',
    borderRadius: '999px',
    border: '1px solid var(--color-ink-line)',
    background: 'var(--deck-scrim-alt-90)',
    color: 'var(--color-cream)',
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
  },
  card: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
    border: '1px solid var(--color-ink-line)',
    background: 'var(--color-ink-raised)',
    transformStyle: 'preserve-3d',
  },
  playerWrap: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  playerThumb: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  frame: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    background: 'transparent',
    transition: 'opacity 0.35s ease',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    display: 'block',
    background: 'transparent',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
    transition: 'opacity 0.35s ease',
  },
  soundBtn: {
    position: 'absolute',
    right: '12px',
    bottom: '12px',
    zIndex: 4,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-cream)',
    background: 'var(--deck-scrim-ground-78)',
    border: '1px solid var(--color-ink-line)',
    borderRadius: '999px',
    padding: '8px 12px',
    cursor: 'pointer',
  },
  soundBtnExpanded: {
    right: '18px',
    bottom: '18px',
    fontSize: '12px',
    padding: '10px 14px',
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
  placeholder: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  placeholderThumb: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.55,
  },
  playBadge: {
    position: 'relative',
    zIndex: 1,
    width: '34px',
    height: '34px',
    borderRadius: '999px',
    background: 'var(--color-cream)',
    color: 'var(--color-ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  modalHint: {
    margin: 0,
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    letterSpacing: '0.04em',
    color: 'var(--color-cream-faint)',
  },
} satisfies Record<string, CSSProperties>
