import type { SlideProps } from '../types'
import type { CSSProperties } from 'react'
import { Layer } from '../components/Layer'
import { SectionLabel } from '../components/SectionLabel'
import { SectionHeadline } from '../components/SectionHeadline'
import { CTAButton } from '../components/CTAButton'
import { GhostNumeral } from '../components/GhostNumeral'
import { useIsMobile } from '../components/ViewportContext'
import { DEPTH } from '../components/motion'
import { safeInsets } from '../components/layout'

// Copy sourced directly from the live studio.famysys.com contact/CTA
// section — not invented for the deck.
export default function CTASlide({ meta }: SlideProps) {
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
          gap: isMobile ? '28px' : '56px',
          paddingBottom: isMobile ? SAFE.bottom : 0,
        }}
      >
        <div style={{ ...styles.top, gap: isMobile ? '16px' : '26px' }}>
          <SectionLabel index={meta.index} total={meta.total} title={meta.title} />
          <SectionHeadline className="display-lg" style={{ ...styles.headline, fontSize: isMobile ? '34px' : '86px' }}>
            Have a creative requirement? Let&rsquo;s talk.
          </SectionHeadline>
          <p className="body-lg" style={{ ...styles.copy, fontSize: isMobile ? '15px' : '23px' }}>
            Tell us what you&rsquo;re trying to create. We&rsquo;ll help you determine the right
            approach, scope and production model.
          </p>
        </div>

        <div style={{ ...styles.ctaBlock, gap: isMobile ? '14px' : '20px' }}>
          <CTAButton href="https://studio.famysys.com/">Start a Conversation</CTAButton>
          <span style={{ ...styles.ctaCaption, fontSize: isMobile ? '12px' : '14px' }}>
            Project-based when you need it. Ongoing when you need more.
          </span>
        </div>
      </Layer>

      <Layer
        depth={DEPTH.decorative}
        style={{
          ...styles.statement,
          left: SAFE.side,
          right: SAFE.side,
          bottom: isMobile ? SAFE.bottom + 8 : 130,
        }}
      >
        <p style={{ ...styles.statementText, fontSize: isMobile ? '18px' : '32px' }}>
          Project today. Creative partner tomorrow.
        </p>
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
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  top: {
    display: 'flex',
    flexDirection: 'column',
  },
  headline: {
    maxWidth: '1300px',
  },
  copy: {
    maxWidth: '680px',
  },
  ctaBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  ctaCaption: {
    fontFamily: 'var(--font-body)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-cream-faint)',
  },
  statement: {
    position: 'absolute',
  },
  statementText: {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    color: 'var(--color-cream)',
    margin: 0,
  },
} satisfies Record<string, CSSProperties>
