import type { Message } from '../types'
import { keywordsOf } from './knowledgeBase'

const ATTACK_WORDS = ['wrong', 'false', 'flawed', 'nonsense', 'hypocrisy', 'hypocrite', 'fails', 'failed', 'lie', 'lies', 'ridiculous', 'disagree', 'mistaken', 'ignorant', 'naive', 'dishonest']
const NEGATION = /\b(not|never|isn't|doesn't|won't|can't|no longer|no)\b/i
const MAX_MEMORY_LINES = 6

export interface MemoryContext {
  /** Bounded, prompt-ready bullet lines — recent opponent points + compressed earlier rounds. Empty when round 1. */
  lines: string[]
  /** This character's own most recent stated position, for self-consistency. */
  selfLastClaim?: string
  /** True if a recent opponent message appears to target this character with a critical/negative claim. */
  wasAttacked: boolean
  /** An earlier self-claim that looks like it contradicts the latest one (heuristic) — null if none detected. */
  contradictionWarning: string | null
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/)
  return (match ? match[0] : text).trim().slice(0, 140)
}

function detectContradiction(selfClaims: string[]): string | null {
  if (selfClaims.length < 2) return null
  const prev = selfClaims[selfClaims.length - 2]
  const latest = selfClaims[selfClaims.length - 1]
  const prevWords = new Set(keywordsOf(prev))
  const latestWords = new Set(keywordsOf(latest))
  const shared = [...prevWords].filter(w => latestWords.has(w))
  if (shared.length === 0) return null
  if (NEGATION.test(prev) !== NEGATION.test(latest)) return prev
  return null
}

/**
 * Replaces the old blind `messages.slice(-8)` dump: picks each opponent's latest message,
 * this character's own last claim, and a one-line compressed summary per earlier round —
 * bounded to MAX_MEMORY_LINES regardless of how long the debate runs.
 */
export function selectRelevantMemory(charId: string, charName: string, messages: Message[]): MemoryContext {
  const real = messages.filter(m => m.charId && m.charId !== 'sys')
  if (real.length === 0) {
    return { lines: [], wasAttacked: false, contradictionWarning: null }
  }

  const selfClaims = real.filter(m => m.charId === charId).map(m => firstSentence(m.text))
  const opponentMsgs = real.filter(m => m.charId !== charId)

  const latestPerOpponent = new Map<string, Message>()
  for (const m of opponentMsgs) latestPerOpponent.set(m.charId, m)

  const recentLines = [...latestPerOpponent.values()]
    .sort((a, b) => a.round - b.round)
    .map(m => `${m.name}: "${firstSentence(m.text)}"`)

  const coveredRounds = new Set([...latestPerOpponent.values()].map(m => m.round))
  const earlierByRound = new Map<number, Message>()
  for (const m of opponentMsgs) {
    if (!coveredRounds.has(m.round) && !earlierByRound.has(m.round)) earlierByRound.set(m.round, m)
  }
  const summaryLines = [...earlierByRound.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([round, m]) => `R${round}: ${m.name} argued "${firstSentence(m.text)}"`)

  const lines = [...summaryLines, ...recentLines].slice(-MAX_MEMORY_LINES)

  const lastTwo = real.slice(-2).filter(m => m.charId !== charId)
  const wasAttacked = lastTwo.some(m => {
    const lower = m.text.toLowerCase()
    return lower.includes(charName.toLowerCase()) && ATTACK_WORDS.some(w => lower.includes(w))
  })

  return {
    lines,
    selfLastClaim: selfClaims[selfClaims.length - 1],
    wasAttacked,
    contradictionWarning: detectContradiction(selfClaims),
  }
}
