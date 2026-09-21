import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import type { MotionStyle } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Layer } from '../components/Layer'
import { SectionLabel } from '../components/SectionLabel'
import { SectionHeadline } from '../components/SectionHeadline'
import { PortfolioMedia } from '../components/PortfolioMedia'
import { VideoGallery } from '../components/VideoGallery'
import { WebsiteGallery } from '../components/WebsiteGallery'
import { PresentationEmbed } from '../components/PresentationEmbed'
import { GhostNumeral } from '../components/GhostNumeral'
import { useIsMobile } from '../components/ViewportContext'
import { useReducedMotionPref } from '../components/MotionPrefContext'
import { DEPTH, EASE_LUX } from '../components/motion'
import { safeInsets } from '../components/layout'
import type {
  DeckImage,
  DeckProcess,
  DeckProject,
  DeckSubcategory,
  GalleryProject,
  PortfolioCategory,
  SlideProps,
} from '../types'

// The category tab is a controlled prop (owned by PresentationShell, not
// local state) so its next/prev arrows can step through tabs before
// falling through to the adjacent slide without reaching into this
// component via a ref — see the comment in PresentationShell.jsx for why.
export default function SelectedWorkSlide({ meta, active, activeTab, onActiveTabChange, content }: SlideProps) {
  const { portfolioCategories } = content
  const isPresent = useIsPresent()
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotionPref()
  const SAFE = safeInsets(isMobile)
  const tab = activeTab
  const [subTab, setSubTab] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  // The tab strip scrolls horizontally on narrow viewports (7 category labels
  // don't fit below ~768px), so stepping to it via next/prev or swipe can land
  // on a tab that's scrolled off-screen with no visible indication which one
  // is active. Keep whichever tab is current in view.
  useEffect(() => {
    tabRefs.current[tab]?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [tab, reducedMotion])
  // A phone on its side is "mobile" by width but has far too little height for a full-width
  // 16:9 frame, which would be cropped by the stage. Those fit by height, like desktop.
  const [isShortLandscape, setIsShortLandscape] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(orientation: landscape) and (max-height: 500px)')
    const sync = () => setIsShortLandscape(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  const [activeProject, setActiveProject] = useState(0)
  const current = portfolioCategories[tab] as PortfolioCategory
  const hasProjects = Array.isArray(current.projects)
  const hasPresentation = Boolean(current.embedUrl)
  const activeProjectData = hasProjects
    ? ((current.projects as ReadonlyArray<DeckProject>)[activeProject] as DeckProject)
    : null
  const hasSubcategories = Array.isArray(current.subcategories) && current.subcategories.length > 0
  const activeSub = hasSubcategories
    ? ((current.subcategories as ReadonlyArray<DeckSubcategory>)[subTab] as DeckSubcategory)
    : null
  const hasImageGallery = hasSubcategories && Array.isArray(activeSub?.images) && activeSub.images.length > 0
  const hasVideoGallery =
    (hasSubcategories && Array.isArray(activeSub?.videos) && activeSub.videos.length > 0) ||
    (!hasSubcategories && Array.isArray(current.videos) && current.videos.length > 0)
  const activeVideos = hasSubcategories ? activeSub?.videos : current.videos
  // The five gallery categories all carry `process`; the two that do not
  // (Websites, Presentation) are handled by earlier branches of galleryBody.
  const categoryProcess = current.process as DeckProcess
  // Non-null throughout the hasProjects branch below, which is guarded by the
  // same Array.isArray(current.projects) that produced it.
  const projectDetail = activeProjectData as DeckProject

  const printProjects: ReadonlyArray<GalleryProject> = useMemo(
    () =>
      hasImageGallery
        ? (activeSub?.images ?? []).map((img: DeckImage, i: number) => ({
            key: img.key || `${activeSub.key}-${i}`,
            title: img.title || `${activeSub.label} ${i + 1}`,
            category: activeSub.label,
            summary: img.summary || current.copy,
            bullets: img.bullets || [],
            url: img.url || '#',
            image: img.image || img.src || null,
            ratio: img.ratio || activeSub.ratio || current.ratio,
          }))
        : [],
    [hasImageGallery, activeSub, current.copy, current.ratio],
  )
  const galleryKey = hasSubcategories
    ? `${current.key}-${activeSub?.key}`
    : current.key

  const galleryRatio =
    (hasImageGallery && (activeSub?.ratio || current.ratio)) ||
    (hasVideoGallery && hasSubcategories && (activeSub?.ratio || current.ratio)) ||
    current.ratio

  const galleryHeight = isMobile
    ? galleryRatio === 'portrait'
      ? Math.min(260, typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.34) : 260)
      : galleryRatio === 'square'
        ? Math.min(210, typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.55) : 210)
        : Math.min(170, typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.42) : 170)
    : hasSubcategories
      ? galleryRatio === 'square'
        ? 460
        : 484
      : 545
  const galleryWidth = isMobile
    ? Math.min(
        typeof window !== 'undefined' ? window.innerWidth - SAFE.side * 2 : 340,
        galleryRatio === 'portrait' ? 180 : galleryRatio === 'square' ? 240 : 320,
      )
    : galleryRatio === 'portrait'
      ? 680 * (galleryHeight / 485)
      : galleryRatio === 'square'
        ? Math.max(galleryHeight * 1.85, 860)
        : 1080 * (galleryHeight / 485)

  useEffect(() => {
    setSubTab(0)
    setActiveProject(0)
  }, [tab])

  useEffect(() => {
    setActiveProject(0)
  }, [subTab])

  function selectTab(i: number) {
    if (i === tab) return
    onActiveTabChange(i)
  }

  const detailsGalleryStyle: CSSProperties = {
    ...styles.detailsGallery,
    maxWidth: isMobile ? 'none' : '400px',
    gap: isMobile ? '14px' : '18px',
    flexShrink: isMobile ? 1 : 1,
    minHeight: 0,
    overflowY: isMobile ? 'visible' : 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
  }

  const processCopyStyle: CSSProperties = {
    ...styles.detailsCopy,
    fontSize: isMobile ? '13px' : '17px',
    lineHeight: isMobile ? 1.55 : 1.45,
    margin: isMobile ? '6px 0 0' : '8px 0 0',
    ...(isMobile ? styles.detailsCopyClamp : null),
  }

  const categoryTitleStyle: CSSProperties = {
    ...styles.detailsLabelSmall,
    fontSize: isMobile ? '26px' : '40px',
    margin: isMobile ? '8px 0 0' : '8px 0 0',
  }

  const galleryBody = hasPresentation ? (
    <div
      style={{
        ...styles.presentationStage,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile && !isShortLandscape ? 'stretch' : 'center',
        justifyContent: 'flex-start',
        gap: isMobile ? '12px' : '28px',
      }}
    >
      <div
        style={{
          ...styles.presentationFrame,
          ...(isMobile && !isShortLandscape
            ? {
                // No grow: the base `flex: 1 1 auto` would stretch the frame down the
                // column and override the 16:9 ratio, leaving a tall portrait iframe.
                flex: '0 0 auto',
                width: '100%',
                height: 'auto',
                aspectRatio: '16 / 9',
                minHeight: '200px',
              }
            : {
                // Fit the full 16:9 deck inside the available stage — never crop.
                height: '100%',
                width: 'auto',
                maxWidth: isMobile ? '100%' : 'calc(100% - 268px)',
                aspectRatio: '16 / 9',
              }),
        }}
      >
        <PresentationEmbed
          src={current.embedUrl as string}
          href={current.url || current.embedUrl}
          title={current.title || current.label}
          active={active}
        />
      </div>

      {!isMobile && (
        <div style={{ ...styles.presentationMeta, width: '240px', gap: '16px', flexShrink: 0 }}>
          <div>
            <span style={{ ...styles.detailsEyebrow, fontSize: '12px' }}>{current.category}</span>
            <h3 style={{ ...styles.detailsLabelSmall, fontSize: '28px', margin: '6px 0 0' }}>
              {current.title || current.label}
            </h3>
          </div>
          {current.summary && (
            <p style={{ ...styles.detailsCopy, fontSize: '15px', margin: 0, lineHeight: 1.5 }}>
              {current.summary}
            </p>
          )}
          <a
            href={current.url || current.embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.openDeckLink}
          >
            Open the full deck
            <ArrowUpRight size={15} strokeWidth={1.75} />
          </a>
        </div>
      )}
    </div>
  ) : hasProjects ? (
    <>
      <div style={{ ...styles.galleryArea, width: isMobile ? '100%' : galleryWidth, maxWidth: isMobile ? '100%' : galleryWidth, height: isMobile ? 'auto' : '100%' }}>
        <WebsiteGallery projects={current.projects} defaultRatio={current.ratio} cardHeight={galleryHeight} onActiveChange={setActiveProject} />
      </div>

      <div style={detailsGalleryStyle} data-scrollable-panel={!isMobile ? true : undefined}>
        <div>
          <span style={{ ...styles.detailsEyebrow, fontSize: isMobile ? '11px' : '13px' }}>{projectDetail.category}</span>
          <h3 style={{ ...categoryTitleStyle, fontSize: isMobile ? '28px' : '40px' }}>
            {projectDetail.title}
          </h3>
        </div>

        <p style={{ ...styles.detailsCopy, fontSize: isMobile ? '14px' : '17px', lineHeight: 1.45, margin: isMobile ? '0' : '4px 0 0' }}>
          {projectDetail.summary}
        </p>

        {!isMobile && (
          <ul style={styles.projectBullets}>
            {projectDetail.bullets.map((b: string) => (
              <li key={b} style={styles.projectBullet}>
                {b}
              </li>
            ))}
          </ul>
        )}

        <a href={projectDetail.url} target="_blank" rel="noopener noreferrer" style={{ ...styles.openDeckLink, fontSize: isMobile ? '13px' : '15px' }}>
          Open the full deck
          <ArrowUpRight size={15} strokeWidth={1.75} />
        </a>
      </div>
    </>
  ) : hasImageGallery ? (
    <>
      <div style={{ ...styles.galleryArea, width: isMobile ? '100%' : galleryWidth, maxWidth: isMobile ? '100%' : galleryWidth, height: isMobile ? 'auto' : '100%' }}>
        <WebsiteGallery projects={printProjects} defaultRatio={galleryRatio} cardHeight={galleryHeight} onActiveChange={setActiveProject} />
      </div>

      <div style={detailsGalleryStyle} data-scrollable-panel={!isMobile ? true : undefined}>
        <div>
          <span style={{ ...styles.detailsEyebrow, fontSize: isMobile ? '11px' : '13px' }}>Category</span>
          <h3 style={categoryTitleStyle}>{activeSub.label}</h3>
        </div>

        <div style={{ ...styles.processBlock, gap: isMobile ? '12px' : '16px' }}>
          <div>
            <span style={{ ...styles.processLabel, fontSize: isMobile ? '11px' : '13px' }}>Input</span>
            <p style={processCopyStyle}>{categoryProcess.input}</p>
          </div>
          <div>
            <span style={{ ...styles.processLabel, fontSize: isMobile ? '11px' : '13px' }}>Output</span>
            <p style={processCopyStyle}>{categoryProcess.output}</p>
          </div>
        </div>
      </div>
    </>
  ) : hasVideoGallery ? (
    <>
      <div style={{ ...styles.galleryArea, width: isMobile ? '100%' : galleryWidth, maxWidth: isMobile ? '100%' : galleryWidth, height: isMobile ? 'auto' : '100%' }}>
        <VideoGallery videos={activeVideos} defaultRatio={current.ratio} cardHeight={galleryHeight} />
      </div>

      <div style={detailsGalleryStyle} data-scrollable-panel={!isMobile ? true : undefined}>
        <div>
          <span style={{ ...styles.detailsEyebrow, fontSize: isMobile ? '11px' : '13px' }}>Category</span>
          <h3 style={categoryTitleStyle}>{current.label}</h3>
        </div>

        <div style={{ ...styles.processBlock, gap: isMobile ? '12px' : '16px' }}>
          <div>
            <span style={{ ...styles.processLabel, fontSize: isMobile ? '11px' : '13px' }}>Input</span>
            <p style={processCopyStyle}>{categoryProcess.input}</p>
          </div>
          <div>
            <span style={{ ...styles.processLabel, fontSize: isMobile ? '11px' : '13px' }}>Output</span>
            <p style={processCopyStyle}>{categoryProcess.output}</p>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div
        style={
          isMobile
            ? { ...styles.mediaCardLandscape, width: '100%', alignSelf: 'stretch' }
            : current.ratio === 'landscape'
              ? styles.mediaCardLandscape
              : styles.mediaCard
        }
      >
        <PortfolioMedia label={current.label} copy={current.copy} media={current.media} active={active} />
      </div>

      <div style={{ ...styles.details, maxWidth: isMobile ? 'none' : '380px' }}>
        <div>
          <span style={{ ...styles.detailsEyebrow, fontSize: isMobile ? '11px' : '15px' }}>Category</span>
          <h3 style={{ ...styles.detailsLabel, fontSize: isMobile ? '28px' : '56px', margin: isMobile ? '8px 0 0' : '18px 0 0' }}>
            {current.label}
          </h3>
          {current.copy && (
            <p style={{ ...styles.detailsCopy, fontSize: isMobile ? '14px' : '23px', margin: isMobile ? '10px 0 0' : '20px 0 0' }}>
              {current.copy}
            </p>
          )}
        </div>
      </div>
    </>
  )

  const contentRowStyle: CSSProperties = {
    ...styles.contentRow,
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '18px' : hasPresentation ? '20px' : '64px',
    justifyContent: isMobile ? 'flex-start' : hasPresentation ? 'flex-start' : 'center',
    // Keep overflow locked on desktop — mixing hidden + visible forces a
    // browser scrollbar and lets wheel events nudge/crop the gallery.
    overflow: isMobile ? 'auto' : 'hidden',
    overscrollBehavior: 'none',
  }

  return (
    <div style={{ ...styles.root, pointerEvents: isPresent ? 'auto' : 'none' }}>
      <Layer depth={DEPTH.background}>
        <GhostNumeral value={meta.index} compact />
      </Layer>

      <Layer
        depth={DEPTH.content}
        style={{
          ...styles.main,
          left: SAFE.side,
          right: SAFE.side,
          top: isMobile ? 56 : 140,
          bottom: isMobile ? Math.max(SAFE.bottom, 88) : 112,
          gap: isMobile ? '10px' : '24px',
          overflow: 'hidden',
          overscrollBehavior: 'none',
        }}
      >
        <div style={{ ...styles.top, gap: isMobile ? '8px' : '24px' }}>
          <SectionLabel index={meta.index} total={meta.total} title={meta.title} />
          <div style={{ ...styles.headlineRow, gap: isMobile ? '8px' : '28px' }}>
            <SectionHeadline className="display-lg" style={{ ...styles.headline, fontSize: isMobile ? '28px' : '64px' }}>
              Selected Work
            </SectionHeadline>
            {!isMobile && <p style={styles.supporting}>A glimpse of what we create for businesses.</p>}
          </div>
        </div>

        <div
          style={{
            ...styles.tabs,
            gap: isMobile ? '14px' : '28px',
            paddingBottom: isMobile ? '10px' : '18px',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          role="tablist"
          aria-label="Portfolio categories"
        >
          {portfolioCategories.map((c, i) => (
            <button
              key={c.key}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              type="button"
              role="tab"
              aria-selected={i === tab}
              onClick={() => selectTab(i)}
              style={{
                ...styles.tabBtn,
                fontSize: isMobile ? '12px' : '15px',
                paddingBottom: isMobile ? '12px' : '18px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                color: i === tab ? 'var(--color-cream)' : 'var(--color-cream-faint)',
              }}
            >
              {c.label}
              {i === tab && isPresent && (
                <motion.span layoutId="portfolio-tab-underline" style={styles.tabUnderline} transition={{ duration: 0.35, ease: EASE_LUX }} />
              )}
            </button>
          ))}
        </div>

        {hasSubcategories && (
          <div
            style={{ ...styles.subTabs, overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch' }}
            role="tablist"
            aria-label={`${current.label} sub-categories`}
          >
            {(current.subcategories ?? []).map((s: DeckSubcategory, i: number) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={i === subTab}
                onClick={() => setSubTab(i)}
                style={{
                  ...styles.subTabBtn,
                  fontSize: isMobile ? '12px' : '16px',
                  padding: isMobile ? '6px 12px' : '7px 16px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  color: i === subTab ? 'var(--color-accent-on-dark)' : 'var(--color-cream-faint)',
                  borderColor: i === subTab ? 'var(--color-accent-on-dark)' : 'var(--color-ink-line)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div style={contentRowStyle}>
          {isPresent ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={galleryKey}
                initial={{ opacity: 0, scale: isMobile ? 1 : 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE_LUX }}
                style={contentRowStyle as MotionStyle}
              >
                {galleryBody}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div style={contentRowStyle}>{galleryBody}</div>
          )}
        </div>
      </Layer>
    </div>
  )
}

const styles = {
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  main: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  top: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  headlineRow: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  headline: {
    margin: 0,
  },
  supporting: {
    fontFamily: 'var(--font-body)',
    fontSize: '20px',
    color: 'var(--color-cream-dim)',
    margin: 0,
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid var(--color-ink-line)',
    flexShrink: 0,
    position: 'relative',
    zIndex: 6,
    background: 'var(--color-bg)',
  },
  tabBtn: {
    position: 'relative',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    transition: 'color 0.25s ease',
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  tabUnderline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '-1px',
    height: '2px',
    background: 'var(--color-accent-on-dark)',
  },
  subTabs: {
    display: 'flex',
    gap: '12px',
    flexShrink: 0,
  },
  subTabBtn: {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    letterSpacing: '0.03em',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-ink-line)',
    transition: 'color 0.2s ease, border-color 0.2s ease',
  },
  galleryArea: {
    flexShrink: 0,
    minWidth: 0,
    position: 'relative',
    zIndex: 0,
    overflow: 'hidden',
  },
  contentRow: {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    minHeight: 0,
    position: 'relative',
    zIndex: 0,
    overflow: 'hidden',
    overscrollBehavior: 'none',
  },
  presentationStage: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'stretch',
  },
  presentationFrame: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
    position: 'relative',
    alignSelf: 'center',
  },
  presentationMeta: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '4px',
  },
  mediaCard: {
    flexShrink: 0,
    height: '100%',
    aspectRatio: '9 / 16',
    overflow: 'hidden',
    border: '1px solid var(--color-ink-line)',
  },
  mediaCardLandscape: {
    flexShrink: 0,
    alignSelf: 'center',
    width: '860px',
    maxHeight: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    border: '1px solid var(--color-ink-line)',
  },
  details: {
    flex: 1,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: '16px',
  },
  detailsGallery: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingBottom: '8px',
    paddingRight: '4px',
    minWidth: 0,
  },
  detailsEyebrow: {
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--color-cream-faint)',
  },
  detailsLabel: {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    color: 'var(--color-fg)',
    lineHeight: 1.08,
  },
  detailsLabelSmall: {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    color: 'var(--color-fg)',
    lineHeight: 1.15,
  },
  detailsCopy: {
    fontFamily: 'var(--font-body)',
    lineHeight: 1.6,
    color: 'var(--color-cream-dim)',
  },
  detailsCopyClamp: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  processBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  processLabel: {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--color-accent-on-dark)',
  },
  projectBullets: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  projectBullet: {
    fontFamily: 'var(--font-body)',
    fontSize: '15.5px',
    lineHeight: 1.4,
    color: 'var(--color-cream-dim)',
  },
  openDeckLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    width: 'fit-content',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.03em',
    color: 'var(--color-cream)',
    paddingBottom: '4px',
    borderBottom: '1px solid var(--color-ink-line)',
    transition: 'border-color 0.2s ease, color 0.2s ease',
  },
} satisfies Record<string, CSSProperties>
