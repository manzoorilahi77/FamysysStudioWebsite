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
export default function CTASlide({ meta, content }: SlideProps) {
  const { cta } = content
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
          ...(isMobile
            ? {
                top: SAFE.top,
                bottom: SAFE.bottom,
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain',
              }
            : null),
        }}
      >
        <div style={{ ...styles.top, gap: isMobile ? '16px' : '26px' }}>
          <SectionLabel index={meta.index} total={meta.total} title={meta.title} />
          <SectionHeadline className="display-lg" style={{ ...styles.headline, fontSize: isMobile ? '34px' : '86px' }}>
            {cta.headline}
          </SectionHeadline>
          <p className="body-lg" style={{ ...styles.copy, fontSize: isMobile ? '15px' : '23px' }}>
            {cta.body}
          </p>
        </div>

        <div style={{ ...styles.ctaBlock, gap: isMobile ? '14px' : '20px' }}>
          <CTAButton href={cta.ctaHref}>{cta.ctaLabel}</CTAButton>
          <span style={{ ...styles.ctaCaption, fontSize: isMobile ? '12px' : '14px' }}>
            {cta.caption}
          </span>
        </div>

        {/* Below the fold on very short viewports (landscape phones) this scrolls into
            view instead of overlapping the button — see the mobile branch above, which
            drops the independent bottom-anchored positioning the desktop layer still uses. */}
        {isMobile && (
          <p style={{ ...styles.statementText, fontSize: '18px', flexShrink: 0 }}>
            Project today. Creative partner tomorrow.
          </p>
        )}
      </Layer>

      {!isMobile && (
        <Layer
          depth={DEPTH.decorative}
          style={{
            ...styles.statement,
            left: SAFE.side,
            right: SAFE.side,
            bottom: 130,
          }}
        >
          <p style={{ ...styles.statementText, fontSize: '32px' }}>
            Project today. Creative partner tomorrow.
          </p>
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
