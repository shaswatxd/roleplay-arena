import type { Character, ChatMessage, Message } from '../types'
import { callAI } from '../utils/groq'

export interface CharacterScore {
  logic: number
  evidence: number
  persuasiveness: number
  consistency: number
  historicalAuthenticity: number
  fallacies: string[]
}

export interface JudgeResult {
  scores: Record<string, CharacterScore>
  closeCall: boolean
  suggestedWinner?: string
  notes: string
}

const SCORE_FIELDS: (keyof Omit<CharacterScore, 'fallacies'>)[] = ['logic', 'evidence', 'persuasiveness', 'consistency', 'historicalAuthenticity']
const MAX_TOTAL = SCORE_FIELDS.length * 100
const CLOSE_CALL_MARGIN = MAX_TOTAL * 0.05

/**
 * Opt-in structured judge (Task 12) — only called when the user clicks "Judge This Debate" in
 * ResultsScreen, not automatically every turn, to avoid doubling API calls on every message.
 */
export async function judgeDebate(
  topic: string,
  characters: Character[],
  messages: Message[],
  apiKeys: Record<string, string>,
  activeProvider?: string
): Promise<JudgeResult> {
  const transcript = messages.filter(m => m.charId && m.charId !== 'sys').map(m => `${m.name}: "${m.text}"`).join('\n')
  const charList = characters.map(c => `${c.id}: ${c.name}`).join('\n')

  const prompt: ChatMessage[] = [
    {
      role: 'system',
      content: `You are an impartial debate judge. Score each character objectively on a 0-100 scale for: logic, evidence, persuasiveness, consistency, historicalAuthenticity. List any logical fallacies you noticed, per character. Judge argument quality and craft — not whether you personally agree with their position. Respond with ONLY valid JSON, no prose outside it, matching exactly this shape:
{"scores": {"<charId>": {"logic": number, "evidence": number, "persuasiveness": number, "consistency": number, "historicalAuthenticity": number, "fallacies": string[]}}, "notes": "one sentence overall observation"}`,
    },
    { role: 'user', content: `TOPIC: ${topic}\n\nCHARACTERS:\n${charList}\n\nTRANSCRIPT:\n${transcript}` },
  ]

  const { text } = await callAI(prompt, apiKeys, activeProvider, 0.3)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Judge did not return valid JSON')
  const parsed = JSON.parse(jsonMatch[0])
  const scores: Record<string, CharacterScore> = parsed.scores || {}

  const totals = Object.entries(scores)
    .map(([id, s]) => [id, SCORE_FIELDS.reduce((sum, f) => sum + (Number(s[f]) || 0), 0)] as [string, number])
    .sort((a, b) => b[1] - a[1])

  // Deterministic margin check — never rely on the model to self-report "too close to call".
  const margin = totals.length >= 2 ? totals[0][1] - totals[1][1] : MAX_TOTAL
  const closeCall = margin < CLOSE_CALL_MARGIN

  return {
    scores,
    closeCall,
    suggestedWinner: closeCall ? undefined : totals[0]?.[0],
    notes: typeof parsed.notes === 'string' ? parsed.notes : '',
  }
}
