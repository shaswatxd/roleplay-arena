import type { Character } from './data/presets'
import type { MutableRefObject } from 'react'

export type { Character } from './data/presets'

export interface Message {
  charId: string
  name?: string
  emoji?: string
  image?: string
  color?: string
  round: number
  text: string
}

export type ScreenName = 'landing' | 'setup' | 'arena' | 'results'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DebateContextType {
  screen: ScreenName
  goTo: (s: ScreenName) => void
  topic: string
  setTopic: (t: string) => void
  characters: Character[]
  togglePreset: (id: string) => void
  removeCharacter: (idx: number) => void
  addCustomCharacter: (char: Partial<Character>) => void
  maxRounds: number
  setMaxRounds: (n: number) => void
  style: string
  setStyle: (s: string) => void
  length: string
  setLength: (s: string) => void
  language: string
  setLanguage: (s: string) => void
  presentDayMode: boolean
  setPresentDayMode: (b: boolean) => void
  currentRound: number
  setCurrentRound: (n: number) => void
  messages: Message[]
  setMessages: (msgs: Message[]) => void
  debateComplete: boolean
  setDebateComplete: (b: boolean) => void
  summary: string
  setSummary: (s: string) => void
  apiKeys: Record<string, string>
  setApiKeys: (keys: Record<string, string>) => void
  activeProvider: string
  setActiveProvider: (id: string) => void
  startDebate: () => Promise<void>
  finishDebate: () => void
  emitToast: MutableRefObject<((msg: string, type?: string) => void) | null>
}
