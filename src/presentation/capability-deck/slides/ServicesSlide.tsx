import type { SlideProps } from '../types'
import type { CSSProperties } from 'react'
import { Layer } from '../components/Layer'
import { SectionLabel } from '../components/SectionLabel'
import { SectionHeadline } from '../components/SectionHeadline'
import { ServiceCard } from '../components/ServiceCard'
import { StaggerGroup, StaggerItem } from '../components/Stagger'
import { GhostNumeral } from '../components/GhostNumeral'
import { useIsMobile } from '../components/ViewportContext'
import { DEPTH } from '../components/motion'
import { safeInsets } from '../components/layout'
import { serviceCategories } from '../data/content'

export default function ServicesSlide({ meta }: SlideProps) {
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
          top: isMobile ? 64 : 152,
          bottom: SAFE.bottom,
          gap: isMobile ? '24px' : '32px',
          overflow: isMobile ? 'auto' : 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        <div style={{ ...styles.top, gap: isMobile ? '16px' : '24px' }}>
          <SectionLabel index={meta.index} total={meta.total} title={meta.title} />
          <SectionHeadline className="display-lg" style={{ ...styles.headline, fontSize: isMobile ? '32px' : '88px' }}>
            What we create.
          </SectionHeadline>
        </div>

        <StaggerGroup
          style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gridTemplateRows: isMobile ? 'auto' : 'repeat(2, auto)',
            columnGap: isMobile ? '18px' : '56px',
            rowGap: isMobile ? '18px' : '40px',
            alignContent: 'start',
            paddingBottom: isMobile ? '12px' : 0,
          }}
        >
          {serviceCategories.map((s, i) => (
            <StaggerItem key={s.title}>
              <ServiceCard
                number={String(i + 1).padStart(2, '0')}
                title={s.title}
                tagline={s.tagline}
                examples={s.examples}
                compact={isMobile}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Layer>

      {!isMobile && (
        <Layer depth={DEPTH.decorative} style={{ ...styles.tally, right: SAFE.side, top: SAFE.top - 40 }}>
          <span style={styles.tallyText}>{String(serviceCategories.length).padStart(2, '0')} disciplines</span>
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
    flex: '0 1 auto',
    display: 'grid',
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
