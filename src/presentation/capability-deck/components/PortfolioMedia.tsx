import type { CSSProperties } from 'react'
import { useState } from 'react'
import type { PortfolioMediaSource } from '../types'
import { Play } from 'lucide-react'

/**
 * Renders real portfolio media (image or video) with lazy loading, or —
 * when no media has been supplied yet — a typography-led placeholder so
 * the slide never fabricates a fake screenshot.
 */
interface PortfolioMediaProps {
  readonly label: string
  readonly copy?: string | undefined
  /** Absent while a slot has no media yet — the placeholder branch below. */
  readonly media?: PortfolioMediaSource | null | undefined
  readonly active?: boolean | undefined
}

export function PortfolioMedia({ label, copy, media, active }: PortfolioMediaProps) {
  const [loaded, setLoaded] = useState(false)

  if (!media) {
    return (
      <div style={styles.placeholder}>
        <span style={styles.placeholderLabel}>{label}</span>
        {copy && <p style={styles.placeholderCopy}>{copy}</p>}
        <span style={styles.placeholderNote}>Media to be added</span>
      </div>
    )
  }

  if (media.type === 'embed') {
    return (
      <div style={styles.frame}>
        <iframe
          style={styles.embed}
          src={media.src}
          title={label}
          allow="autoplay; fullscreen"
          frameBorder="0"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div style={styles.frame}>
      {media.type === 'video' ? (
        <video
          style={{ ...styles.media, opacity: loaded ? 1 : 0 }}
          src={active ? media.src : undefined}
          poster={media.poster}
          muted
          loop
          playsInline
          autoPlay={active}
          preload={active ? 'auto' : 'none'}
          onLoadedData={() => setLoaded(true)}
        />
      ) : (
        <img
          style={{ ...styles.media, opacity: loaded ? 1 : 0 }}
          src={media.src}
          alt={label}
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
      )}
      {media.type === 'video' && (
        <span style={styles.playBadge}>
          <Play size={13} fill="currentColor" strokeWidth={0} />
        </span>
      )}
    </div>
  )
}

const styles = {
  frame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: 'var(--color-ink-raised)',
  },
  media: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.5s ease',
  },
  embed: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
  playBadge: {
    position: 'absolute',
    bottom: '18px',
    right: '18px',
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    background: 'var(--color-cream)',
    color: 'var(--color-ink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '26px',
    border: '1px solid var(--color-ink-line)',
    background: 'var(--color-ink-raised)',
  },
  placeholderLabel: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    color: 'var(--color-fg)',
    lineHeight: 1.15,
  },
  placeholderCopy: {
    fontFamily: 'var(--font-body)',
    fontSize: '13.5px',
    lineHeight: 1.45,
    color: 'var(--color-cream-faint)',
    margin: 0,
  },
  placeholderNote: {
    fontFamily: 'var(--font-body)',
    fontSize: '10.5px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-cream-ghost)',
    marginTop: '8px',
  },
} satisfies Record<string, CSSProperties>
