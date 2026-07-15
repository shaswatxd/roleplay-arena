import { describe, it, expect } from 'vitest'
import { nextEmotion, createEmotionTracker } from './emotion'

describe('nextEmotion', () => {
  it('escalates up the ladder when attacked and emotional control is low', () => {
    expect(nextEmotion('calm', true, 20, 'calm')).toBe('confident')
    expect(nextEmotion('confident', true, 20, 'calm')).toBe('annoyed')
    expect(nextEmotion('annoyed', true, 20, 'calm')).toBe('angry')
  })

  it('does not escalate past angry', () => {
    expect(nextEmotion('angry', true, 20, 'calm')).toBe('angry')
  })

  it('resists escalation when emotionalControl is very high', () => {
    expect(nextEmotion('calm', true, 90, 'calm')).toBe('calm')
  })

  it('decays back toward calm when not attacked, if emotionalControl allows', () => {
    expect(nextEmotion('angry', false, 60, 'calm')).toBe('annoyed')
    expect(nextEmotion('annoyed', false, 60, 'calm')).toBe('confident')
  })

  it('stays put when not attacked but emotionalControl is too low to decay', () => {
    expect(nextEmotion('angry', false, 30, 'calm')).toBe('angry')
  })

  it('returns to baseline once fully decayed', () => {
    expect(nextEmotion('calm', false, 60, 'inspired')).toBe('inspired')
  })
})

describe('createEmotionTracker', () => {
  it('tracks per-character state independently and resets cleanly', () => {
    const tracker = createEmotionTracker()
    expect(tracker.current('a', 'calm')).toBe('calm')
    tracker.update('a', true, 10, 'calm')
    expect(tracker.current('a', 'calm')).toBe('confident')
    expect(tracker.current('b', 'calm')).toBe('calm')
    tracker.reset()
    expect(tracker.current('a', 'calm')).toBe('calm')
  })
})
