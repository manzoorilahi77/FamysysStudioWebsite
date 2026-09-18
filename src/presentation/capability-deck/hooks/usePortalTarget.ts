import { useEffect, useState } from 'react'

/**
 * Modals must portal into the native fullscreen element when the deck is in
 * fullscreen — content outside `document.fullscreenElement` renders behind
 * it (browser top-layer), so a body portal would be invisible there.
 */
export function usePortalTarget(): Element {
  const [target, setTarget] = useState<Element>(() =>
    typeof document === 'undefined' ? (null as unknown as Element) : document.fullscreenElement ?? document.body,
  )

  useEffect(() => {
    function onChange() {
      setTarget(document.fullscreenElement ?? document.body)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  return target
}
