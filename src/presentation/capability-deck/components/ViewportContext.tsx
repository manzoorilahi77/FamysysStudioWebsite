import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

interface ViewportValue {
  readonly isMobile: boolean
}

interface ViewportProviderProps {
  readonly isMobile: boolean
  readonly children: ReactNode
}

const ViewportContext = createContext<ViewportValue>({ isMobile: false })

export function ViewportProvider({ isMobile, children }: ViewportProviderProps) {
  return <ViewportContext.Provider value={{ isMobile }}>{children}</ViewportContext.Provider>
}

export function useIsMobile() {
  return useContext(ViewportContext).isMobile
}
