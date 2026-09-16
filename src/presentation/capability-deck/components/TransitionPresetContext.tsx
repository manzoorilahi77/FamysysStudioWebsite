import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { Direction, TransitionPreset } from '../types'

interface TransitionPresetValue {
  readonly preset: TransitionPreset
  readonly direction: Direction
}

interface TransitionPresetProviderProps extends TransitionPresetValue {
  readonly children: ReactNode
}
import { TRANSITIONS } from './motion'

// TRANSITIONS is a non-empty literal; the index is narrowed once here rather
// than asserted away at every use.
const FIRST_PRESET = TRANSITIONS[0] as TransitionPreset

const TransitionPresetContext = createContext<TransitionPresetValue>({
  preset: FIRST_PRESET,
  direction: 1,
})

export function TransitionPresetProvider({ preset, direction, children }: TransitionPresetProviderProps) {
  return <TransitionPresetContext.Provider value={{ preset, direction }}>{children}</TransitionPresetContext.Provider>
}

export function useTransitionPreset() {
  return useContext(TransitionPresetContext)
}
