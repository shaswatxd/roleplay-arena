import { describe, it, expect } from 'vitest'
import { buildPrompt, computeTemperature } from './promptBuilder'
import type { CharacterDNA } from './characterDNA'
import type { Message } from '../types'

function makeDNA(overrides: Partial<CharacterDNA> = {}): CharacterDNA {
  return {
    id: 'gandhi', name: 'Mahatma Gandhi', emoji: '🕊️', color: '#34d399', role: 'role', style: 'calm and philosophical',
    era: '1869-1948', occupation: 'independence leader', ideology: 'Satyagraha',
    coreBeliefs: ['non-violence'], vocabulary: ['truth', 'ahimsa'], sentenceLength: 'medium',
    traits: { confidence: 70, aggression: 5, humor: 20, sarcasm: 10, emotionalControl: 95 },
    decisionMakingStyle: '', debateStrategy: ['reframe morally'], favoritePhrases: ['Be the change'],
    commonArguments: [], commonAnalogies: [], neverSays: [], forbiddenWords: [],
    ethicsValues: [], writingStyle: 'gentle', conversationHabits: [], responsePacing: 'deliberate', baselineEmotion: 'calm',
    ...overrides,
  }
}

describe('buildPrompt', () => {
  it('produces a system message followed by a user message', () => {
    const result = buildPrompt({
      dna: makeDNA(), topic: 'Is technology good for society?', currentRound: 1, maxRounds: 3,
      style: 'casual', length: 'medium', language: 'english', messages: [], emotion: 'calm',
    })
    expect(result).toHaveLength(2)
    expect(result[0].role).toBe('system')
    expect(result[1].role).toBe('user')
  })

  it('includes the character name and topic in the system prompt', () => {
    const dna = makeDNA()
    const [system] = buildPrompt({
      dna, topic: 'Is technology good for society?', currentRound: 1, maxRounds: 3,
      style: 'casual', length: 'medium', language: 'english', messages: [], emotion: 'calm',
    })
    expect(system.content).toContain('Mahatma Gandhi')
    expect(system.content).toContain('Is technology good for society?')
  })

  it('says "speaking first" when there is no prior history', () => {
    const dna = makeDNA()
    const [, user] = buildPrompt({
      dna, topic: 'Topic', currentRound: 1, maxRounds: 3,
      style: 'casual', length: 'medium', language: 'english', messages: [], emotion: 'calm',
    })
    expect(user.content).toMatch(/speaking first/i)
  })

  it('includes opponent dialogue in the user message once history exists', () => {
    const dna = makeDNA()
    const messages: Message[] = [{ charId: 'trump', name: 'Donald Trump', round: 1, text: 'Technology is tremendous, the best.' }]
    const [, user] = buildPrompt({
      dna, topic: 'Topic', currentRound: 2, maxRounds: 3,
      style: 'casual', length: 'medium', language: 'english', messages, emotion: 'calm',
    })
    expect(user.content).toContain('Donald Trump')
  })

  it('omits the knowledge layer entirely when no verified quotes exist', () => {
    const dna = makeDNA({ verifiedQuotes: undefined })
    const [system] = buildPrompt({
      dna, topic: 'Topic', currentRound: 1, maxRounds: 3,
      style: 'casual', length: 'medium', language: 'english', messages: [], emotion: 'calm',
    })
    expect(system.content).not.toContain('VERIFIED REFERENCE')
  })

  it('includes a correction notice when a retry is requested', () => {
    const dna = makeDNA()
    const [system] = buildPrompt({
      dna, topic: 'Topic', currentRound: 1, maxRounds: 3,
      style: 'casual', length: 'medium', language: 'english', messages: [], emotion: 'calm',
      correction: 'Broke character with an AI disclaimer',
    })
    expect(system.content).toContain('IMPORTANT CORRECTION')
  })
})

describe('computeTemperature', () => {
  it('gives a calm, high-control character a lower temperature than an aggressive, low-control one', () => {
    const calm = makeDNA({ traits: { confidence: 50, aggression: 5, humor: 20, sarcasm: 10, emotionalControl: 95 } })
    const volatile = makeDNA({ traits: { confidence: 50, aggression: 90, humor: 50, sarcasm: 70, emotionalControl: 20 } })
    expect(computeTemperature(calm)).toBeLessThan(computeTemperature(volatile))
  })

  it('always stays within the clamped range', () => {
    const extreme = makeDNA({ traits: { confidence: 100, aggression: 100, humor: 100, sarcasm: 100, emotionalControl: 0 } })
    const t = computeTemperature(extreme)
    expect(t).toBeGreaterThanOrEqual(0.5)
    expect(t).toBeLessThanOrEqual(1.0)
  })
})
