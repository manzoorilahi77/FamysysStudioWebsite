import type { CSSProperties, MouseEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useIsMobile } from './ViewportContext'

const TOUCH_TARGET_PX = 44

/**
 * Live deck preview in a 16:9 iframe that fills the slot. The embedded deck lays out to the
 * iframe's own viewport (no cover-crop scale), so its slides stay fully visible and centred.
 * The corner control opens the full page.
 *
 * His version also rewrote `src` through `resolveEmbedSrc` (a Vite dev proxy path, and a
 * relative `/corporate/` on any famysys.com host). Neither is carried over: `import.meta.env`
 * does not exist under Next, and `/corporate/` on this host is a 404. `src` is the CMS's
 * "Embed URL", used as given — see docs/capability-deck-sync-2026-09.md.
 */
interface PresentationEmbedProps {
  readonly src: string
  readonly href?: string | undefined
  readonly title?: string | undefined
  readonly active?: boolean | undefined
}

export function PresentationEmbed({ src, href, title, active = true }: PresentationEmbedProps) {
  const isMobile = useIsMobile()
  const openUrl = href || src

  function openDeck(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (!openUrl) return
    window.open(openUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div data-media-player="true" style={styles.frame} aria-label={`${title || 'Presentation'} deck preview`}>
      {active && (
        <iframe
          style={styles.iframe}
          src={src}
          title={title || 'Presentation deck'}
          allow="fullscreen; autoplay"
          allowFullScreen
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      <a href={openUrl} target="_blank" rel="noopener noreferrer" onClick={openDeck} style={isMobile ? { ...styles.hint, minHeight: `${TOUCH_TARGET_PX}px` } : styles.hint}>
        Open full deck
        <ArrowUpRight size={14} strokeWidth={1.75} />
      </a>
    </div>
  )
}

const styles = {
  frame: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '220px',
    overflow: 'hidden',
    border: '1px solid var(--color-ink-line)',
    background: 'var(--deck-embed-backdrop)',
  },
  iframe: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
    background: 'var(--deck-embed-backdrop)',
  },
  hint: {
    position: 'absolute',
    right: '12px',
    bottom: '12px',
    zIndex: 2,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--color-cream)',
    background: 'var(--deck-scrim-ground-72)',
    border: '1px solid var(--color-ink-line)',
    borderRadius: '999px',
    padding: '8px 12px',
    textDecoration: 'none',
  },
} satisfies Record<string, CSSProperties>
