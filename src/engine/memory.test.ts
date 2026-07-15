import { describe, it, expect } from 'vitest'
import { selectRelevantMemory } from './memory'
import type { Message } from '../types'

function msg(charId: string, name: string, round: number, text: string): Message {
  return { charId, name, round, text }
}

describe('selectRelevantMemory', () => {
  it('returns empty context on round 1 with no prior messages', () => {
    const result = selectRelevantMemory('elon', 'Elon Musk', [])
    expect(result.lines).toHaveLength(0)
    expect(result.wasAttacked).toBe(false)
    expect(result.selfLastClaim).toBeUndefined()
  })

  it('picks up each opponent\'s latest message, not a blind slice', () => {
    const messages = [
      msg('gandhi', 'Gandhi', 1, 'Non-violence is the only path.'),
      msg('elon', 'Elon Musk', 1, 'Mars is the backup plan for humanity.'),
      msg('gandhi', 'Gandhi', 2, 'Violence only breeds more violence.'),
    ]
    const result = selectRelevantMemory('elon', 'Elon Musk', messages)
    expect(result.lines.some(l => l.includes('Violence only breeds more violence'))).toBe(true)
  })

  it('caps memory to a bounded number of lines regardless of debate length', () => {
    const messages: Message[] = []
    for (let r = 1; r <= 20; r++) {
      messages.push(msg('gandhi', 'Gandhi', r, `Argument number ${r} about the topic.`))
    }
    const result = selectRelevantMemory('elon', 'Elon Musk', messages)
    expect(result.lines.length).toBeLessThanOrEqual(6)
  })

  it('detects an attack when an opponent recently targeted this character by name with negative language', () => {
    const messages = [
      msg('gandhi', 'Gandhi', 1, 'Elon Musk is wrong about this — his logic is flawed.'),
    ]
    const result = selectRelevantMemory('elon', 'Elon Musk', messages)
    expect(result.wasAttacked).toBe(true)
  })

  it('does not flag an attack from neutral opponent dialogue', () => {
    const messages = [
      msg('gandhi', 'Gandhi', 1, 'I believe non-violence is powerful.'),
    ]
    const result = selectRelevantMemory('elon', 'Elon Musk', messages)
    expect(result.wasAttacked).toBe(false)
  })

  it('flags a contradiction when the character reverses a stance with shared keywords', () => {
    const messages = [
      msg('elon', 'Elon Musk', 1, 'Regulation is not necessary for innovation.'),
      msg('elon', 'Elon Musk', 2, 'Regulation is necessary for innovation to succeed.'),
    ]
    const result = selectRelevantMemory('elon', 'Elon Musk', messages)
    expect(result.contradictionWarning).not.toBeNull()
  })
})
