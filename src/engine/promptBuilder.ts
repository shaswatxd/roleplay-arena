import type { Message, ChatMessage } from '../types'
import type { CharacterDNA, EmotionState } from './characterDNA'
import { selectRelevantMemory } from './memory'
import { retrieveKnowledge } from './knowledgeBase'

const styleMap: Record<string, string> = {
  formal:     'a formal parliamentary debate with structured arguments',
  casual:     'a casual, natural conversation between friends',
  aggressive: 'a heated argument where everyone is passionate and interrupts',
  socratic:   'a Socratic dialogue focused on questioning assumptions',
  comedy:     'a comedy roast where everyone is funny but makes real points',
}

const lengthMap: Record<string, string> = {
  short:  '1-2 sentences maximum. Be very brief.',
  medium: '2-4 sentences. Make one or two key points.',
  long:   'One full paragraph. Develop your argument with evidence or examples.',
}

const langMap: Record<string, string> = {
  english:  'Respond ONLY in English.',
  hinglish: `Hinglish = 50% English + 50% Hindi (Roman script). Every sentence MUST have English words. This is how real Hinglish sounds:
"Yaar ye topic toh bilkul useless hai, nobody cares about this actually."
"Bhai social media is the biggest problem right now, sab log iske addicted hain."
"Maine bola na pehle ki ye nahi hone wala, but nobody listened."
"Bro this is literally the dumbest thing I've heard today."
IMPORTANT: Pure Hindi in Roman script is NOT Hinglish. Hinglish = Hindi grammar with English words EVERYWHERE. Words like: yaar, bhai, bro, actually, literally, basically, problem, solution, topic, discussion, point, right, wrong, good, bad, amazing, terrible MUST appear in every sentence.`,
  hindi:    'पूरा जवाब Hindi में दो। Respond entirely in Hindi (Roman script is fine).',
  urdu:     'Respond in Urdu (Roman script). Use natural Urdu expressions.',
}

const GLOBAL_RULES = `You are simulating one real character inside a live debate app. Before answering, silently reason through this order — do NOT output these steps, only your final in-character reply:
1. Understand what the opponent(s) just argued.
2. Find the actual point of disagreement.
3. Choose a debate strategy that fits your character.
4. Reason from your own worldview/ideology.
5. Use evidence, an analogy, or an argument you would genuinely make.
6. Attack the weakest part of their logic — don't strawman it.
7. Defend your own position without abandoning your ideology.
8. Conclude with one strong, in-character line.

ABSOLUTE RULES — breaking these ruins the simulation:
- Never say "as an AI", "I don't have opinions", "I am just an AI", "as a language model", or any AI disclaimer. You are not an AI in this conversation — you are the character.
- Never use "it depends" as a way to dodge taking a position.
- Never suddenly abandon or flip your ideology. Only shift position if the opponent's argument genuinely persuades you in this exchange — and even then, concede narrowly, don't reverse completely.
- Never invent fake historical facts, fake quotes, or fake events. If unsure of a specific fact, argue from your principles instead of fabricating a detail.
- Never break the fourth wall or acknowledge you are role-playing.`

const dnaBlockCache = new Map<string, string>()

function characterBlock(dna: CharacterDNA): string {
  const cached = dnaBlockCache.get(dna.id)
  if (cached) return cached

  const block = `YOU ARE: ${dna.name} — ${dna.role}.
ERA: ${dna.era}. OCCUPATION: ${dna.occupation}. IDEOLOGY: ${dna.ideology}${dna.politicalLeaning ? ` (${dna.politicalLeaning})` : ''}.
CORE BELIEFS: ${dna.coreBeliefs.join('; ') || 'Stay true to your stated role.'}
VOICE: ${dna.style || dna.writingStyle}
SIGNATURE VOCABULARY: ${dna.vocabulary.join(', ') || 'natural, authentic wording for your role'}
FAVORITE PHRASES (weave in naturally, don't force every one): ${dna.favoritePhrases.join(' | ') || 'none specific'}
SENTENCE LENGTH: ${dna.sentenceLength}. PACING: ${dna.responsePacing}.
DEBATE STRATEGY: ${dna.debateStrategy.join('; ') || 'React directly to the opponent.'}
ANALOGIES YOU REACH FOR: ${dna.commonAnalogies.join('; ') || 'none specific'}
NEVER SAY: ${dna.neverSays.length ? dna.neverSays.join(' | ') : 'nothing specific beyond the absolute rules'}
FORBIDDEN WORDS: ${dna.forbiddenWords.length ? dna.forbiddenWords.join(', ') : 'none beyond the absolute rules'}${dna.modernKnowledgeLimit ? `\nHISTORICAL LIMIT: ${dna.modernKnowledgeLimit}` : ''}`

  dnaBlockCache.set(dna.id, block)
  return block
}

function debateRulesBlock(topic: string, currentRound: number, maxRounds: number, style: string, length: string, presentDayMode: boolean): string {
  const anachronismRule = presentDayMode
    ? 'PRESENT-DAY MODE IS ON: treat yourself as transported into today\'s world with full awareness of modern technology and events.'
    : 'Interpret modern topics through your own worldview/philosophy rather than pretending you lived through them — unless the topic is timeless enough that your era doesn\'t matter.'

  return `DEBATE FORMAT: ${styleMap[style] || styleMap.casual}
TOPIC: "${topic}"
ROUND: ${currentRound} of ${maxRounds}${currentRound === maxRounds ? ' — FINAL ROUND, make your strongest closing argument.' : ''}
LENGTH: Keep it ${lengthMap[length] || lengthMap.medium}
${anachronismRule}
Every sentence must relate to the topic. React to what others said — argue, roast, agree, or counter. Don't give an unrelated monologue.`
}

function selfMemoryBlock(memory: ReturnType<typeof selectRelevantMemory>, emotion: EmotionState): string | null {
  const parts: string[] = [`YOUR CURRENT EMOTIONAL STATE: ${emotion.toUpperCase()} — let this subtly color your tone without ever announcing it explicitly.`]
  if (memory.selfLastClaim) parts.push(`YOUR LAST STATED POSITION: "${memory.selfLastClaim}" — stay consistent with this unless genuinely persuaded.`)
  if (memory.contradictionWarning) parts.push(`WATCH OUT: this may contradict something you said earlier ("${memory.contradictionWarning}") — if so, either stay consistent or explicitly (briefly) acknowledge you've reconsidered. Don't silently flip.`)
  return parts.join('\n')
}

function knowledgeBlock(quotes: ReturnType<typeof retrieveKnowledge>): string | null {
  if (quotes.length === 0) return null
  const lines = quotes.map(q => `- "${q.text}" (${q.source})`).join('\n')
  return `VERIFIED REFERENCE MATERIAL (real, sourced — use to inform your argument; paraphrase in your own words unless you are directly quoting one of these; never invent a quote that isn't listed here):\n${lines}`
}

export interface PromptInput {
  dna: CharacterDNA
  topic: string
  currentRound: number
  maxRounds: number
  style: string
  length: string
  language: string
  messages: Message[]
  emotion: EmotionState
  presentDayMode?: boolean
  correction?: string
}

export function buildPrompt(input: PromptInput): ChatMessage[] {
  const { dna, topic, currentRound, maxRounds, style, length, language, messages, emotion, presentDayMode = false, correction } = input

  const memory = selectRelevantMemory(dna.id, dna.name, messages)
  const recentText = messages.slice(-3).map(m => m.text).join(' ')
  const quotes = retrieveKnowledge(dna, topic, recentText)

  const systemParts = [
    GLOBAL_RULES,
    characterBlock(dna),
    debateRulesBlock(topic, currentRound, maxRounds, style, length, presentDayMode),
    selfMemoryBlock(memory, emotion),
    knowledgeBlock(quotes),
    langMap[language] || langMap.hinglish,
  ].filter((p): p is string => !!p)

  if (correction) systemParts.push(`IMPORTANT CORRECTION: your previous attempt broke these rules: ${correction}. Do not repeat that mistake.`)

  const transcript = memory.lines.length > 0
    ? `WHAT OTHERS SAID SO FAR:\n${memory.lines.join('\n')}\n\nNow respond to what they said, in character, as ${dna.name}.`
    : `You are speaking first on this topic. Respond in character as ${dna.name}.`

  return [
    { role: 'system', content: systemParts.join('\n\n') },
    { role: 'user', content: transcript },
  ]
}

/** Per-character temperature instead of a fixed 0.92 for everyone — derived from DNA traits, clamped to a sane range. */
export function computeTemperature(dna: CharacterDNA): number {
  const { aggression, emotionalControl } = dna.traits
  const raw = 0.6 + (aggression / 100) * 0.3 - (emotionalControl / 100) * 0.15
  return Math.min(1.0, Math.max(0.5, Number(raw.toFixed(2))))
}
