import { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { PROVIDERS } from './data/providers'
import { PRESETS } from './data/presets'
import type { Character, Message, ScreenName, DebateContextType } from './types'
import { resetDebateState } from './engine/debateEngine'

const DebateContext = createContext<DebateContextType | null>(null)

// Vite only inlines import.meta.env.VITE_X when referenced statically (literal dot access) —
// a dynamic `import.meta.env['VITE_' + computedKey]` lookup never gets replaced at build time
// and silently resolves to undefined in production. Keep this map's keys in sync with
// AIProvider.keyField in data/providers.ts.
const ENV_KEYS: Record<string, string | undefined> = {
  groqKey: import.meta.env.VITE_GROQKEY,
  openrouterKey: import.meta.env.VITE_OPENROUTERKEY,
}

export function DebateProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<ScreenName>('landing')
  const [topic, setTopic] = useState('')
  const [characters, setCharacters] = useState<Character[]>([])
  const [maxRounds, setMaxRounds] = useState(3)
  const [style, setStyle] = useState('casual')
  const [length, setLength] = useState('medium')
  const [language, setLanguage] = useState('hinglish')
  const [presentDayMode, setPresentDayMode] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [debateComplete, setDebateComplete] = useState(false)
  const [summary, setSummary] = useState('')
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [activeProvider, setActiveProvider] = useState('groq')

  const emitToast = useRef<((msg: string, type?: string) => void) | null>(null)

  useEffect(() => {
    const cfg = (window as any).RPA_CONFIG || {}
    const keys: Record<string, string> = {}
    for (const p of PROVIDERS) {
      const fromCfg = cfg[p.keyField]
      const fromEnv = ENV_KEYS[p.keyField]
      if (fromCfg) keys[p.keyField] = fromCfg
      else if (fromEnv) keys[p.keyField] = fromEnv
    }
    if (Object.keys(keys).length > 0) setApiKeys(keys)
  }, [])

  const goTo = useCallback((s: ScreenName) => {
    setScreen(s)
    setSummary('')
  }, [])

  const togglePreset = useCallback((id: string) => {
    setCharacters(prev => {
      const exists = prev.find(c => c.id === id)
      if (exists) return prev.filter(c => c.id !== id)
      if (prev.length >= 4) return prev
      const preset = PRESETS.find(p => p.id === id)
      return [...prev, { ...preset!, isCustom: false }]
    })
  }, [])

  const removeCharacter = useCallback((idx: number) => {
    setCharacters(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const addCustomCharacter = useCallback((char: Partial<Character>) => {
    setCharacters(prev => {
      if (prev.length >= 4) return prev
      return [...prev, { ...char as Character, isCustom: true, id: 'custom_' + Date.now() }]
    })
  }, [])

  const startDebate = useCallback(async () => {
    if (!topic.trim()) { emitToast.current?.('Enter a debate topic first', 'error'); return }
    if (characters.length < 2) { emitToast.current?.('Select at least 2 characters', 'error'); return }

    resetDebateState()
    setCurrentRound(0)
    setMessages([])
    setDebateComplete(false)
    setSummary('')
    setScreen('arena')
  }, [topic, characters])

  const finishDebate = useCallback(() => {
    setDebateComplete(true)
    setScreen('results')
  }, [])

  const value: DebateContextType = useMemo(() => ({
    screen, goTo, topic, setTopic,
    characters, togglePreset, removeCharacter, addCustomCharacter,
    maxRounds, setMaxRounds, style, setStyle, length, setLength, language, setLanguage,
    presentDayMode, setPresentDayMode,
    currentRound, setCurrentRound, messages, setMessages,
    debateComplete, setDebateComplete, summary, setSummary,
    apiKeys, setApiKeys, activeProvider, setActiveProvider,
    startDebate, finishDebate,
    emitToast,
  }), [
    screen, topic, characters, maxRounds, style, length, language, presentDayMode,
    currentRound, messages, debateComplete, summary, apiKeys, activeProvider,
    goTo, togglePreset, removeCharacter, addCustomCharacter,
    startDebate, finishDebate,
  ])

  return (
    <DebateContext.Provider value={value}>
      {children}
    </DebateContext.Provider>
  )
}

export function useDebate(): DebateContextType {
  const ctx = useContext(DebateContext)
  if (!ctx) throw new Error('useDebate must be used within DebateProvider')
  return ctx
}
