import type { SlideProps } from '../types'
import type { CSSProperties } from 'react'
import { Layer } from '../components/Layer'
import { SectionHeadline } from '../components/SectionHeadline'
import { useIsMobile } from '../components/ViewportContext'
import { DEPTH } from '../components/motion'
import { safeInsets } from '../components/layout'

export default function CoverSlide({ content }: SlideProps) {
  const { cover } = content
  const isMobile = useIsMobile()
  const SAFE = safeInsets(isMobile)

  return (
    <div style={styles.root}>
      <Layer depth={DEPTH.background} className="cover-bg" style={{
        ...styles.bgLayer,
        paddingRight: SAFE.side,
        paddingBottom: SAFE.bottom,
        justifyContent: isMobile ? 'center' : 'flex-end',
        alignItems: isMobile ? 'flex-end' : 'flex-end',
      }}>
        <img
          src={cover.logoMark}
          alt=""
          aria-hidden="true"
          style={{
            ...styles.bgLogo,
            width: isMobile ? '220px' : '630px',
            opacity: isMobile ? 0.07 : 0.1,
          }}
        />
      </Layer>

      <Layer depth={DEPTH.content} style={{
        ...styles.content,
        left: SAFE.side,
        right: SAFE.side,
        gap: isMobile ? '18px' : '28px',
        maxWidth: isMobile ? 'none' : '1420px',
        paddingTop: isMobile ? 24 : 0,
        paddingBottom: isMobile ? SAFE.bottom : 0,
      }}>
        <span className="eyebrow" style={{ ...styles.brand, fontSize: isMobile ? '12px' : '17px' }}>
          {cover.brand}
        </span>
        <SectionHeadline
          as="h1"
          className="display-xl"
          style={{ ...styles.headline, fontSize: isMobile ? '36px' : '96px', maxWidth: isMobile ? 'none' : '1300px' }}
        >
          {cover.headlineLine1}
          <br />
          {cover.headlineLead} <em style={styles.headlineAccent}>{cover.headlineAccent}</em>
        </SectionHeadline>
        <p style={{ ...styles.supporting, fontSize: isMobile ? '14px' : '20px' }}>
          {cover.supporting}
        </p>
      </Layer>

      {!isMobile && (
        <Layer depth={DEPTH.decorative} style={{ ...styles.decorative, right: SAFE.side, top: SAFE.top - 40 }}>
          <span style={styles.decorativeLabel}>{cover.decorativeLabel}</span>
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
    overflow: 'hidden',
  },
  bgLayer: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    boxSizing: 'border-box',
  },
  bgLogo: {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
    display: 'block',
  },
  content: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brand: {},
  headline: {},
  headlineAccent: {
    fontFamily: 'var(--font-accent)',
    fontStyle: 'italic',
    fontWeight: 400,
    color: 'var(--color-accent-on-dark)',
  },
  supporting: {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-cream-dim)',
    letterSpacing: '0.01em',
    margin: 0,
  },
  decorative: {
    position: 'absolute',
  },
  decorativeLabel: {
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--color-cream-faint)',
  },
} satisfies Record<string, CSSProperties>
