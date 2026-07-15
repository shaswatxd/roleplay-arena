import type { CharacterDNA } from './characterDNA'

export const BANNED_PHRASES: RegExp[] = [
  /as an ai/i,
  /i(?:'|’)m just an ai/i,
  /i am just an ai/i,
  /as a language model/i,
  /as an artificial intelligence/i,
  /i(?:'|’)m an ai/i,
  /\bi am an ai\b/i,
  /i don(?:'|’)t have (?:personal )?opinions/i,
  /i cannot have opinions/i,
  /^it depends\.?$/i,
  /it depends on (?:your|the) perspective/i,
  /i cannot (?:provide|generate|engage)/i,
  /i(?:'|’)m not able to/i,
]

export interface ValidationResult {
  pass: boolean
  reasons: string[]
}

function soundsGeneric(text: string, dna: CharacterDNA): boolean {
  const wordCount = text.split(/\s+/).length
  if (wordCount < 12) return false
  const signature = [...dna.vocabulary, ...dna.favoritePhrases]
  if (signature.length === 0) return false
  const lower = text.toLowerCase()
  return !signature.some(s => s && lower.includes(s.toLowerCase()))
}

/** Task 3 (persona lock) + Task 10 (consistency checker) in one pass — no extra LLM call. */
export function validate(text: string, dna: CharacterDNA): ValidationResult {
  const reasons: string[] = []
  const lower = text.toLowerCase()

  for (const re of BANNED_PHRASES) {
    if (re.test(text)) reasons.push(`Broke character with an AI-disclaimer-style phrase (matched ${re.source})`)
  }
  for (const word of dna.forbiddenWords) {
    if (word && lower.includes(word.toLowerCase())) reasons.push(`Used a forbidden word/phrase for ${dna.name}: "${word}"`)
  }
  for (const phrase of dna.neverSays) {
    if (phrase && lower.includes(phrase.toLowerCase())) reasons.push(`Said something ${dna.name} would never say: "${phrase}"`)
  }
  if (soundsGeneric(text, dna)) {
    reasons.push(`Response uses none of ${dna.name}'s signature vocabulary/phrases — sounds generic.`)
  }

  return { pass: reasons.length === 0, reasons }
}

/** Last-resort local fix after a failed regenerate: strip only the offending sentences instead of looping. */
export function sanitize(text: string, dna: CharacterDNA): string {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const clean = sentences.filter(s => {
    const lower = s.toLowerCase()
    if (BANNED_PHRASES.some(re => re.test(s))) return false
    if (dna.forbiddenWords.some(w => w && lower.includes(w.toLowerCase()))) return false
    return true
  })
  const result = clean.join(' ').trim()
  return result.length > 0 ? result : text
}
