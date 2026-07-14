import { createContext, useContext, useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { PRESETS } from './data/presets'
import { PROVIDERS } from './data/providers'
import type { Character, Message, ScreenName, DebateContextType } from './types'
import { buildContext, callAI } from './utils/groq'
import { delay } from './utils/helpers'

const DebateContext = createContext<DebateContextType | null>(null)

export function DebateProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<ScreenName>('landing')
  const [topic, setTopic] = useState('')
  const [characters, setCharacters] = useState<Character[]>([])
  const [maxRounds, setMaxRounds] = useState(3)
  const [style, setStyle] = useState('casual')
  const [length, setLength] = useState('medium')
  const [language, setLanguage] = useState('hinglish')
  const [currentRound, setCurrentRound] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [debateComplete, setDebateComplete] = useState(false)
  const [summary, setSummary] = useState('')
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [activeProvider, setActiveProvider] = useState('groq')

  const pausedRef = useRef(false)
  const runningRef = useRef(false)

  const emitToast = useRef<((msg: string, type?: string) => void) | null>(null)

  const apiKeysRef = useRef(apiKeys)
  apiKeysRef.current = apiKeys

  useEffect(() => {
    const cfg = (window as any).RPA_CONFIG || {}
    const keys: Record<string, string> = {}
    for (const p of PROVIDERS) {
      const fromCfg = cfg[p.keyField]
      const fromEnv = (import.meta as any)?.env?.['VITE_' + p.keyField.toUpperCase()]
      if (fromCfg) keys[p.keyField] = fromCfg
      else if (fromEnv) keys[p.keyField] = fromEnv
    }
    console.log('[Config] API keys loaded:', Object.keys(keys).map(k => k + '=' + (keys[k] ? 'YES' : 'NO')).join(', '))
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

    setCurrentRound(0)
    setMessages([])
    setIsRunning(false)
    setIsPaused(false)
    setDebateComplete(false)
    setSummary('')
    setScreen('arena')

    await delay(100)
    runRound()
  }, [topic, characters, maxRounds, style, length, language, apiKeys])

  const runRound = useCallback(async () => {
    if (pausedRef.current) return

    setCurrentRound(prev => {
      const newRound = prev + 1
      if (newRound > maxRounds) {
        finishDebate()
        return prev
      }
      return newRound
    })
  }, [maxRounds])

  const nextRound = useCallback(() => {
    if (currentRound >= maxRounds) {
      finishDebate()
    } else {
      runRound()
    }
  }, [currentRound, maxRounds, runRound])

  const togglePause = useCallback(() => {
    setIsPaused(prev => {
      const next = !prev
      pausedRef.current = next
      return next
    })
  }, [])

  const finishDebate = useCallback(() => {
    setDebateComplete(true)
    setIsRunning(false)
    setScreen('results')
  }, [])

  async function generateDebateMessages(): Promise<Message[]> {
    const charList = characters
    const rounds = maxRounds
    const allMsgs: Message[] = []

    for (let r = 1; r <= rounds; r++) {
      if (pausedRef.current) break
      for (const char of charList) {
        if (pausedRef.current) break
        const ctx = buildContext(char, topic, r, rounds, style, length, language, allMsgs)
        try {
          const { text } = await callAI(ctx, apiKeysRef.current, activeProvider)
          allMsgs.push({
            charId: char.id,
            name: char.name,
            emoji: char.emoji,
            image: char.image,
            color: char.color,
            round: r,
            text,
          })
        } catch (err) {
          emitToast.current?.('API error — check your keys', 'error')
          pausedRef.current = true
          setIsPaused(true)
          break
        }
        await delay(300)
      }
    }

    return allMsgs
  }

  const value: DebateContextType = useMemo(() => ({
    screen, goTo, topic, setTopic,
    characters, togglePreset, removeCharacter, addCustomCharacter,
    maxRounds, setMaxRounds, style, setStyle, length, setLength, language, setLanguage,
    currentRound, setCurrentRound, messages, setMessages,
    isRunning, setIsRunning, isPaused, setIsPaused, pausedRef, runningRef,
    debateComplete, setDebateComplete, summary, setSummary,
    apiKeys, setApiKeys, activeProvider, setActiveProvider,
    startDebate, nextRound, togglePause, finishDebate,
    emitToast, generateDebateMessages,
  }), [
    screen, topic, characters, maxRounds, style, length, language,
    currentRound, messages, isRunning, isPaused, debateComplete, summary, apiKeys, activeProvider,
    goTo, togglePreset, removeCharacter, addCustomCharacter,
    startDebate, nextRound, togglePause, finishDebate,
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
