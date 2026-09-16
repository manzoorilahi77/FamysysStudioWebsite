import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

interface MotionPrefProviderProps {
  readonly reduced: boolean
  readonly children: ReactNode
}

const MotionPrefContext = createContext<boolean>(false)

export function MotionPrefProvider({ reduced, children }: MotionPrefProviderProps) {
  return <MotionPrefContext.Provider value={reduced}>{children}</MotionPrefContext.Provider>
}

export function useReducedMotionPref() {
  return useContext(MotionPrefContext)
}
