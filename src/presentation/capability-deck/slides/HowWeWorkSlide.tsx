import type { SlideProps } from '../types'
import type { CSSProperties } from 'react'
import { Layer } from '../components/Layer'
import { SectionLabel } from '../components/SectionLabel'
import { SectionHeadline } from '../components/SectionHeadline'
import { ProcessStep } from '../components/ProcessStep'
import { StaggerGroup, StaggerItem } from '../components/Stagger'
import { GhostNumeral } from '../components/GhostNumeral'
import { useIsMobile } from '../components/ViewportContext'
import { DEPTH } from '../components/motion'
import { safeInsets } from '../components/layout'

export default function HowWeWorkSlide({ meta, content }: SlideProps) {
  const { processSteps } = content
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
          bottom: isMobile ? SAFE.bottom : 220,
          gap: isMobile ? '20px' : '44px',
          overflowY: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        <div style={{ ...styles.top, gap: isMobile ? '14px' : '22px' }}>
          <SectionLabel index={meta.index} total={meta.total} title={meta.title} />
          <SectionHeadline
            className="display-lg"
            style={{ ...styles.headline, fontSize: isMobile ? '32px' : '68px', maxWidth: isMobile ? 'none' : '1100px' }}
          >
            From your idea to finished content.
          </SectionHeadline>
        </div>

        <StaggerGroup
          style={{
            ...styles.steps,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '22px' : '40px',
          }}
        >
          {processSteps.map((step, i) => (
            <StaggerItem key={step.index} style={isMobile ? styles.stepItemMobile : styles.stepItem}>
              <ProcessStep
                index={step.index}
                title={step.title}
                copy={step.copy}
                isLast={i === processSteps.length - 1}
                compact={isMobile}
                vertical={isMobile}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {isMobile && (
          <p style={styles.closingTextMobile}>You bring the idea. We bring it to life.</p>
        )}
      </Layer>

      {!isMobile && (
        <Layer depth={DEPTH.decorative} style={{ ...styles.closing, left: SAFE.side, right: SAFE.side }}>
          <p style={styles.closingText}>You bring the idea. We bring it to life.</p>
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
  headline: {},
  steps: {
    display: 'flex',
    minHeight: 0,
  },
  stepItem: {
    flex: 1,
    minWidth: 0,
  },
  stepItemMobile: {
    flex: '0 0 auto',
    width: '100%',
  },
  closing: {
    position: 'absolute',
    bottom: 130,
  },
  closingText: {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    fontSize: '32px',
    color: 'var(--color-cream)',
    margin: 0,
  },
  closingTextMobile: {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    fontSize: '18px',
    color: 'var(--color-cream)',
    margin: '8px 0 0',
    flexShrink: 0,
  },
} satisfies Record<string, CSSProperties>
