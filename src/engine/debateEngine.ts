import type { Character, Message } from '../types'
import type { EmotionState } from './characterDNA'
import { getDNA } from './dnaRegistry'
import { buildPrompt, computeTemperature } from './promptBuilder'
import { validate, sanitize } from './personaGuard'
import { selectRelevantMemory } from './memory'
import { emotionTracker } from './emotion'
import { callAI } from '../utils/groq'

export interface DebateSettings {
  style: string
  length: string
  language: string
  presentDayMode?: boolean
}

export interface TurnResult {
  text: string
  providerId: string
  emotion: EmotionState
  regenerated: boolean
}

/**
 * Single entry point for producing one character's turn: build layered prompt -> call LLM at a
 * per-character temperature -> persona-guard validate -> bounded (1x) regenerate on failure ->
 * local sanitize as last resort. Replaces the buildContext+callAI calls that used to be
 * duplicated between ArenaScreen and the (now removed) DebateContext round-runner.
 */
export async function runTurn(
  char: Character,
  topic: string,
  currentRound: number,
  maxRounds: number,
  settings: DebateSettings,
  messages: Message[],
  apiKeys: Record<string, string>,
  activeProvider?: string
): Promise<TurnResult> {
  const dna = getDNA(char)
  const memory = selectRelevantMemory(dna.id, dna.name, messages)
  const emotion = emotionTracker.update(dna.id, memory.wasAttacked, dna.traits.emotionalControl, dna.baselineEmotion)
  const temperature = computeTemperature(dna)

  const basePromptInput = {
    dna, topic, currentRound, maxRounds,
    style: settings.style, length: settings.length, language: settings.language,
    messages, emotion, presentDayMode: settings.presentDayMode,
  }

  const first = await callAI(buildPrompt(basePromptInput), apiKeys, activeProvider, temperature)
  let text = first.text
  let providerId = first.providerId
  let regenerated = false

  let result = validate(text, dna)
  if (!result.pass) {
    regenerated = true
    const retry = await callAI(
      buildPrompt({ ...basePromptInput, correction: result.reasons.join('; ') }),
      apiKeys,
      providerId,
      temperature
    )
    text = retry.text
    providerId = retry.providerId
    result = validate(text, dna)
    if (!result.pass) {
      text = sanitize(text, dna)
    }
  }

  return { text, providerId, emotion, regenerated }
}

export function resetDebateState(): void {
  emotionTracker.reset()
}
