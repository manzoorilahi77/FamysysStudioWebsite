import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

interface FullscreenControls {
  readonly isFullscreen: boolean
  readonly toggle: () => void
}

export function useFullscreen(
  targetRef: RefObject<HTMLElement | null>,
): FullscreenControls {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function onChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      targetRef.current?.requestFullscreen?.().catch(() => {})
    }
  }, [targetRef])

  return { isFullscreen, toggle }
}
