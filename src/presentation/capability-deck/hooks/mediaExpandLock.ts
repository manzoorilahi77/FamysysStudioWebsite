const ATTR = 'data-media-expanded'

/** True while a gallery Expand modal is open — blocks deck tab/slide nav. */
export function isMediaExpanded() {
  return typeof document !== 'undefined' && document.body?.hasAttribute(ATTR)
}

export function setMediaExpanded(open: boolean): void {
  if (typeof document === 'undefined') return
  if (open) document.body.setAttribute(ATTR, 'true')
  else document.body.removeAttribute(ATTR)
}
