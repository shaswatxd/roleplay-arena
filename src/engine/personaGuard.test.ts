import { describe, it, expect } from 'vitest'
import { validate, sanitize } from './personaGuard'
import type { CharacterDNA } from './characterDNA'

function makeDNA(overrides: Partial<CharacterDNA> = {}): CharacterDNA {
  return {
    id: 'test', name: 'Test Character', emoji: '🎭', color: '#fff', role: 'role', style: 'style',
    era: 'present-day', occupation: 'occupation', ideology: 'ideology',
    coreBeliefs: [], vocabulary: ['bhai', 'yaar'], sentenceLength: 'medium',
    traits: { confidence: 50, aggression: 50, humor: 50, sarcasm: 50, emotionalControl: 50 },
    decisionMakingStyle: '', debateStrategy: [], favoritePhrases: ['trust me bhai'],
    commonArguments: [], commonAnalogies: [], neverSays: ['I surrender'], forbiddenWords: ['banana'],
    ethicsValues: [], writingStyle: '', conversationHabits: [], responsePacing: 'measured', baselineEmotion: 'calm',
    ...overrides,
  }
}

describe('personaGuard.validate', () => {
  it('flags AI-disclaimer phrases', () => {
    const result = validate('As an AI, I do not have opinions on this.', makeDNA())
    expect(result.pass).toBe(false)
    expect(result.reasons.length).toBeGreaterThan(0)
  })

  it('flags a bare "it depends" cop-out', () => {
    const result = validate('It depends.', makeDNA())
    expect(result.pass).toBe(false)
  })

  it('flags forbidden words for the character', () => {
    const result = validate('I really love banana splits, bhai, trust me bhai on this one, it is great.', makeDNA())
    expect(result.pass).toBe(false)
    expect(result.reasons.some(r => r.includes('banana'))).toBe(true)
  })

  it('flags neverSays phrases', () => {
    const result = validate('I surrender to your logic, bhai, trust me bhai completely on this.', makeDNA())
    expect(result.pass).toBe(false)
  })

  it('flags a long response with no signature vocabulary as generic', () => {
    const dna = makeDNA({ vocabulary: ['bhai'], favoritePhrases: ['trust me bhai'] })
    const generic = 'This is a perfectly reasonable response that contains absolutely no signature flavor whatsoever and goes on for a while.'
    const result = validate(generic, dna)
    expect(result.pass).toBe(false)
    expect(result.reasons.some(r => r.includes('generic'))).toBe(true)
  })

  it('passes a clean, in-character, on-topic response', () => {
    const dna = makeDNA()
    const result = validate('Trust me bhai, this argument makes no sense at all, yaar.', dna)
    expect(result.pass).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })
})

describe('personaGuard.sanitize', () => {
  it('strips only the offending sentence, keeps the rest', () => {
    const dna = makeDNA()
    const text = 'This is a fine opening line. As an AI, I cannot have a real opinion. This is a fine closing line.'
    const cleaned = sanitize(text, dna)
    expect(cleaned).not.toMatch(/as an ai/i)
    expect(cleaned).toContain('fine opening line')
    expect(cleaned).toContain('fine closing line')
  })

  it('falls back to the original text if everything gets stripped', () => {
    const dna = makeDNA()
    const text = 'As an AI, I cannot have opinions.'
    const cleaned = sanitize(text, dna)
    expect(cleaned.length).toBeGreaterThan(0)
  })
})
