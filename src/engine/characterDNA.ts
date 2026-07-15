import type { Character } from '../data/presets'

export type EmotionState = 'calm' | 'confident' | 'annoyed' | 'angry' | 'sarcastic' | 'inspired' | 'disappointed'

export interface Traits {
  confidence: number
  aggression: number
  humor: number
  sarcasm: number
  emotionalControl: number
}

export interface VerifiedQuote {
  text: string
  source: string
}

export interface CharacterDNA extends Character {
  era: string
  occupation: string
  ideology: string
  politicalLeaning?: string
  coreBeliefs: string[]
  vocabulary: string[]
  sentenceLength: 'short' | 'medium' | 'long' | 'variable'
  traits: Traits
  decisionMakingStyle: string
  debateStrategy: string[]
  favoritePhrases: string[]
  commonArguments: string[]
  commonAnalogies: string[]
  neverSays: string[]
  forbiddenWords: string[]
  modernKnowledgeLimit?: string
  historicalContext?: string
  ethicsValues: string[]
  religiousViews?: string
  economicViews?: string
  leadershipStyle?: string
  writingStyle: string
  conversationHabits: string[]
  responsePacing: 'rapid-fire' | 'measured' | 'deliberate'
  baselineEmotion: EmotionState
  verifiedQuotes?: VerifiedQuote[]
}

const idRegistry = new Map<string, CharacterDNA>()
const nameRegistry = new Map<string, CharacterDNA>()

export function registerDNA(entries: CharacterDNA[]): void {
  for (const e of entries) {
    idRegistry.set(e.id, e)
    nameRegistry.set(e.name.toLowerCase(), e)
  }
}

function textIncludesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some(k => lower.includes(k))
}

/** Synthesizes a reasonable CharacterDNA for custom/Wikipedia-detected characters that have no hand-authored profile. */
export function inferDNA(char: Character): CharacterDNA {
  const text = `${char.role} ${char.style}`
  const aggression = textIncludesAny(text, ['aggressive', 'attack', 'fiery', 'angry', 'savage', 'roast', 'confrontational']) ? 70 : 40
  const humor = textIncludesAny(text, ['comedy', 'funny', 'joke', 'humor', 'roast', 'comedian', 'witty']) ? 75 : 30
  const sarcasm = textIncludesAny(text, ['sarcastic', 'dry wit', 'deadpan', 'sarcasm', 'ironic']) ? 70 : 30
  const confidence = textIncludesAny(text, ['confident', 'bold', 'fearless', 'alpha', 'commanding']) ? 75 : 55
  const emotionalControl = textIncludesAny(text, ['calm', 'measured', 'composed', 'collected', 'soft-spoken']) ? 75 : 45

  return {
    ...char,
    era: 'present-day',
    occupation: char.role,
    ideology: 'Not formally defined — inferred only from role and speaking style.',
    coreBeliefs: [],
    vocabulary: [],
    sentenceLength: 'medium',
    traits: { confidence, aggression, humor, sarcasm, emotionalControl },
    decisionMakingStyle: 'Reacts pragmatically to what the opponent says.',
    debateStrategy: ['React directly to the last thing said', 'Stay true to the stated role and style'],
    favoritePhrases: [],
    commonArguments: [],
    commonAnalogies: [],
    neverSays: [],
    forbiddenWords: [],
    ethicsValues: [],
    writingStyle: char.style || 'Natural and authentic.',
    conversationHabits: [],
    responsePacing: 'measured',
    baselineEmotion: 'calm',
  }
}

/** Resolves the full DNA profile for a runtime Character: curated profile if registered, otherwise a synthesized one. */
export function getDNA(char: Character): CharacterDNA {
  const byId = idRegistry.get(char.id)
  if (byId) return byId
  const byName = nameRegistry.get(char.name.toLowerCase())
  if (byName) return { ...byName, id: char.id, image: char.image ?? byName.image, color: char.color ?? byName.color }
  return inferDNA(char)
}
