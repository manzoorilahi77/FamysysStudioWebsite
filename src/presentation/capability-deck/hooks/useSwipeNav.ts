import { useRef } from 'react'
import type { TouchEvent as ReactTouchEvent } from 'react'

interface SwipeNavHandlers {
  readonly onNext: () => void
  readonly onPrev: () => void
}

interface TouchOrigin {
  readonly x: number
  readonly y: number
}
import { isMediaExpanded } from './mediaExpandLock'

const SWIPE_THRESHOLD = 50

function touchBlocked(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('[data-media-player="true"]') ||
      target.closest('video') ||
      target.closest('iframe') ||
      target.closest('a') ||
      target.closest('button'),
  )
}

export function useSwipeNav({ onNext, onPrev }: SwipeNavHandlers) {
  const touchStart = useRef<TouchOrigin | null>(null)

  function onTouchStart(e: ReactTouchEvent) {
    if (isMediaExpanded()) return
    if (touchBlocked(e.target)) {
      touchStart.current = null
      return
    }
    const touch = e.touches[0]
    if (!touch) return
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  function onTouchEnd(e: ReactTouchEvent) {
    if (isMediaExpanded()) return
    if (!touchStart.current) return
    if (touchBlocked(e.target)) {
      touchStart.current = null
      return
    }
    const touch = e.changedTouches[0]
    if (!touch) {
      touchStart.current = null
      return
    }
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) onNext()
    else onPrev()
  }

  return { onTouchStart, onTouchEnd }
}
