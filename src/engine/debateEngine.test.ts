import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runTurn, resetDebateState } from './debateEngine'
import type { Character } from '../types'

vi.mock('../utils/groq', () => ({
  callAI: vi.fn(),
}))

import { callAI } from '../utils/groq'

const elon: Character = { id: 'elon', name: 'Elon Musk', emoji: '🚀', color: '#06b6d4', role: 'Tech billionaire', style: 'Short punchy tweets.' }
const settings = { style: 'casual', length: 'medium', language: 'english' }

describe('runTurn', () => {
  beforeEach(() => {
    resetDebateState()
    vi.mocked(callAI).mockReset()
  })

  it('returns the first response unmodified when it passes validation', async () => {
    vi.mocked(callAI).mockResolvedValueOnce({ text: "Obviously, that's just physics — Mars is the backup plan.", providerId: 'groq' })
    const result = await runTurn(elon, 'Should we colonize Mars?', 1, 3, settings, [], { groqKey: 'x' }, 'groq')
    expect(result.regenerated).toBe(false)
    expect(result.text).toContain('Mars')
    expect(callAI).toHaveBeenCalledTimes(1)
  })

  it('regenerates once when the first response breaks persona, and uses the clean retry', async () => {
    vi.mocked(callAI)
      .mockResolvedValueOnce({ text: 'As an AI, I do not have opinions on this.', providerId: 'groq' })
      .mockResolvedValueOnce({ text: "Obviously, that's just physics — Mars is the backup plan.", providerId: 'groq' })
    const result = await runTurn(elon, 'Should we colonize Mars?', 1, 3, settings, [], { groqKey: 'x' }, 'groq')
    expect(result.regenerated).toBe(true)
    expect(result.text).not.toMatch(/as an ai/i)
    expect(callAI).toHaveBeenCalledTimes(2)
  })

  it('never calls the LLM a 3rd time — falls back to local sanitize if the retry also fails', async () => {
    vi.mocked(callAI)
      .mockResolvedValueOnce({ text: 'As an AI, I do not have opinions. That said, Mars is interesting.', providerId: 'groq' })
      .mockResolvedValueOnce({ text: 'As an AI, I still cannot have opinions. But Mars is interesting.', providerId: 'groq' })
    const result = await runTurn(elon, 'Should we colonize Mars?', 1, 3, settings, [], { groqKey: 'x' }, 'groq')
    expect(result.regenerated).toBe(true)
    expect(result.text).not.toMatch(/as an ai/i)
    expect(callAI).toHaveBeenCalledTimes(2)
  })

  it('returns a per-turn emotion state', async () => {
    vi.mocked(callAI).mockResolvedValueOnce({ text: "Obviously, that's just physics.", providerId: 'groq' })
    const result = await runTurn(elon, 'Should we colonize Mars?', 1, 3, settings, [], { groqKey: 'x' }, 'groq')
    expect(typeof result.emotion).toBe('string')
  })
})
