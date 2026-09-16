// Shared safe-area so content never collides with the persistent logo
// (top-left) or navigation/progress chrome (bottom) rendered by
// PresentationShell.
export interface SafeInsets {
  readonly top: number
  readonly bottom: number
  readonly side: number
}

export const SAFE: SafeInsets = {
  top: 168,
  bottom: 172,
  side: 120,
}

// Tighter insets for the fluid mobile stage (stage = viewport, scale 1).
export const SAFE_MOBILE: SafeInsets = {
  top: 64,
  bottom: 96,
  side: 16,
}

export function safeInsets(isMobile: boolean): SafeInsets {
  return isMobile ? SAFE_MOBILE : SAFE
}
