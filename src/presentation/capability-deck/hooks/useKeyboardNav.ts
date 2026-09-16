import { useEffect } from 'react'

interface KeyboardNavHandlers {
  readonly onNext: () => void
  readonly onPrev: () => void
  readonly onFirst: () => void
  readonly onLast: () => void
}
import { isMediaExpanded } from './mediaExpandLock'

export function useKeyboardNav({ onNext, onPrev, onFirst, onLast }: KeyboardNavHandlers): void {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isMediaExpanded()) return
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          onNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onPrev()
          break
        case ' ':
          e.preventDefault()
          if (e.shiftKey) onPrev()
          else onNext()
          break
        case 'Home':
          e.preventDefault()
          onFirst()
          break
        case 'End':
          e.preventDefault()
          onLast()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNext, onPrev, onFirst, onLast])
}
