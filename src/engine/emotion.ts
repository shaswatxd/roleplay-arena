import type { EmotionState } from './characterDNA'

const ESCALATION_LADDER: EmotionState[] = ['calm', 'confident', 'annoyed', 'angry']

/**
 * One-step-at-a-time state machine: escalates up the ladder when attacked (unless high
 * emotionalControl resists it), decays back toward baseline otherwise. Emotions outside the
 * ladder (sarcastic/inspired/disappointed) are treated as alternate baselines, not intermediate
 * escalation rungs — an attack still nudges them onto the ladder.
 */
export function nextEmotion(current: EmotionState, wasAttacked: boolean, emotionalControl: number, baseline: EmotionState): EmotionState {
  const idx = ESCALATION_LADDER.indexOf(current)

  if (wasAttacked) {
    const resists = emotionalControl >= 80
    if (resists) return current
    const from = idx === -1 ? 0 : idx
    const nextIdx = Math.min(from + 1, ESCALATION_LADDER.length - 1)
    return ESCALATION_LADDER[nextIdx]
  }

  if (idx > 0) {
    const decays = emotionalControl >= 50
    return decays ? ESCALATION_LADDER[idx - 1] : current
  }

  return baseline
}

/** Per-debate emotion tracker. One instance lives for the lifetime of a single running debate. */
export function createEmotionTracker() {
  const state = new Map<string, EmotionState>()
  return {
    current(charId: string, baseline: EmotionState): EmotionState {
      return state.get(charId) ?? baseline
    },
    update(charId: string, wasAttacked: boolean, emotionalControl: number, baseline: EmotionState): EmotionState {
      const current = state.get(charId) ?? baseline
      const next = nextEmotion(current, wasAttacked, emotionalControl, baseline)
      state.set(charId, next)
      return next
    },
    reset(): void {
      state.clear()
    },
  }
}

export const emotionTracker = createEmotionTracker()
