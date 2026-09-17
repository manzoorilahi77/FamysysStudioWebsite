import type { SlideProps } from '../types'
import type { CSSProperties } from 'react'
import { Layer } from '../components/Layer'
import { SectionLabel } from '../components/SectionLabel'
import { SectionHeadline } from '../components/SectionHeadline'
import { StaggerGroup, StaggerItem } from '../components/Stagger'
import { GhostNumeral } from '../components/GhostNumeral'
import { useIsMobile } from '../components/ViewportContext'
import { DEPTH } from '../components/motion'
import { safeInsets } from '../components/layout'

export default function WhoWeAreSlide({ meta, content }: SlideProps) {
  const { whoWeAre } = content
  const isMobile = useIsMobile()
  const SAFE = safeInsets(isMobile)

  return (
    <div style={styles.root}>
      <Layer depth={DEPTH.background}>
        <GhostNumeral value={meta.index} compact={isMobile} />
      </Layer>

      <Layer
        depth={DEPTH.content}
        style={{
          ...styles.main,
          left: SAFE.side,
          right: SAFE.side,
          top: isMobile ? 64 : 140,
          bottom: SAFE.bottom,
          gap: isMobile ? '28px' : '48px',
          overflow: isMobile ? 'auto' : 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        <div style={{ ...styles.top, gap: isMobile ? '16px' : '28px' }}>
          <div style={{ ...styles.topMeta, flexWrap: isMobile ? 'wrap' : 'nowrap', rowGap: '10px' }}>
            <SectionLabel index={meta.index} total={meta.total} title={meta.title} />
            <div style={styles.metaFacts}>
              <span style={{ ...styles.metaPill, fontSize: isMobile ? '11px' : '13px', padding: isMobile ? '6px 12px' : '8px 14px' }}>
                Est. {whoWeAre.established}
              </span>
              <span style={{ ...styles.metaLocations, fontSize: isMobile ? '13px' : '15px' }}>{whoWeAre.locations}</span>
            </div>
          </div>

          <SectionHeadline
            className="display-lg"
            style={{
              ...styles.headline,
              fontSize: isMobile ? '30px' : '72px',
              maxWidth: isMobile ? 'none' : '1180px',
            }}
          >
            {whoWeAre.headline}
          </SectionHeadline>

          <p
            className="body-lg"
            style={{
              ...styles.copy,
              fontSize: isMobile ? '15px' : '22px',
              maxWidth: isMobile ? 'none' : '760px',
            }}
          >
            {whoWeAre.copy}
          </p>
        </div>

        <StaggerGroup
          style={{
            ...styles.highlights,
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '18px' : '48px',
          }}
        >
          {whoWeAre.highlights.map((h) => (
            <StaggerItem
              key={h.title}
              style={{
                ...styles.highlight,
                gap: isMobile ? '12px' : '18px',
                paddingTop: isMobile ? '16px' : '22px',
              }}
            >
              <span className="hairline" />
              <h3 style={{ ...styles.highlightTitle, fontSize: isMobile ? '24px' : '36px' }}>{h.title}</h3>
              <p style={{ ...styles.highlightCopy, fontSize: isMobile ? '14px' : '18px' }}>{h.copy}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <StaggerGroup
          style={{
            ...styles.principles,
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '20px' : '48px',
            paddingTop: isMobile ? '20px' : '28px',
            marginTop: 'auto',
          }}
        >
          {whoWeAre.visionMission.map((item) => (
            <StaggerItem key={item.title} style={{ ...styles.principle, gap: isMobile ? '10px' : '14px' }}>
              <span style={{ ...styles.principleLabel, fontSize: isMobile ? '12px' : '14px' }}>{item.title}</span>
              <p style={{ ...styles.principleCopy, fontSize: isMobile ? '15px' : '20px' }}>{item.copy}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
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
  },
  top: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  topMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  metaFacts: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  metaPill: {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--color-cream)',
    background: 'var(--color-accent)',
    borderRadius: '999px',
  },
  metaLocations: {
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.06em',
    color: 'var(--color-cream-dim)',
  },
  headline: {
    margin: 0,
  },
  copy: {
    margin: 0,
    lineHeight: 1.55,
    color: 'var(--color-cream-dim)',
  },
  highlights: {
    display: 'grid',
    flexShrink: 0,
  },
  highlight: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  highlightTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    color: 'var(--color-fg)',
    margin: 0,
    lineHeight: 1.15,
  },
  highlightCopy: {
    fontFamily: 'var(--font-body)',
    lineHeight: 1.55,
    color: 'var(--color-cream-faint)',
    margin: 0,
    maxWidth: '560px',
  },
  principles: {
    display: 'grid',
    borderTop: '1px solid var(--color-ink-line)',
    flexShrink: 0,
  },
  principle: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  principleLabel: {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--color-accent-on-dark)',
  },
  principleCopy: {
    fontFamily: 'var(--font-body)',
    lineHeight: 1.55,
    color: 'var(--color-cream-dim)',
    margin: 0,
    maxWidth: '620px',
  },
} satisfies Record<string, CSSProperties>
