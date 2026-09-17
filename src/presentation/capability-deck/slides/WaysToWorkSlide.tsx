import type { SlideProps } from '../types'
import type { CSSProperties } from 'react'
import { Layer } from '../components/Layer'
import { SectionLabel } from '../components/SectionLabel'
import { SectionHeadline } from '../components/SectionHeadline'
import { EngagementCard } from '../components/EngagementCard'
import { StaggerGroup, StaggerItem } from '../components/Stagger'
import { GhostNumeral } from '../components/GhostNumeral'
import { useIsMobile } from '../components/ViewportContext'
import { DEPTH } from '../components/motion'
import { safeInsets } from '../components/layout'

export default function WaysToWorkSlide({ meta, content }: SlideProps) {
  const { engagementModels } = content
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
          gap: isMobile ? '20px' : '40px',
          overflow: isMobile ? 'auto' : 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        <div style={{ ...styles.top, gap: isMobile ? '14px' : '24px' }}>
          <SectionLabel index={meta.index} total={meta.total} title={meta.title} />
          <SectionHeadline className="display-lg" style={{ ...styles.headline, fontSize: isMobile ? '30px' : '80px' }}>
            Work with us your way.
          </SectionHeadline>
        </div>

        <StaggerGroup
          style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: isMobile ? '14px' : '28px',
          }}
        >
          {engagementModels.map((m, i) => (
            <StaggerItem key={m.tag}>
              <EngagementCard
                tag={m.tag}
                title={m.title}
                audience={m.audience}
                examples={m.examples}
                emphasized={i === engagementModels.length - 1}
                compact={isMobile}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Layer>

      {!isMobile && (
        <Layer depth={DEPTH.decorative} style={{ ...styles.tally, right: SAFE.side, top: SAFE.top - 40 }}>
          <span style={styles.tallyText}>{String(engagementModels.length).padStart(2, '0')} engagement models</span>
        </Layer>
      )}
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
  headline: {
    maxWidth: '1180px',
  },
  grid: {
    flex: 1,
    display: 'grid',
    alignContent: 'start',
    minHeight: 0,
  },
  tally: {
    position: 'absolute',
  },
  tallyText: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--color-cream-faint)',
  },
} satisfies Record<string, CSSProperties>
