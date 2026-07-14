import { PERSONALITIES, findPersonality } from '../data/personalities'
import type { Personality } from '../data/personalities'

interface DetectResult {
  name: string
  role: string
  style: string
  emoji: string
  image?: string
  color: string
}

const COLORS = ['#7c3aed','#06b6d4','#f0abfc','#fbbf24','#34d399','#f87171','#fb923c','#a78bfa','#3b82f6','#ef4444','#22c55e','#eab308']
const EMOJI_MAP: Record<string, string> = {
  comedian: '🎤', youtuber: '📺', actor: '🎭', singer: '🎵', politician: '🎙️',
  writer: '✍️', athlete: '🏃', cricketer: '🏏', footballer: '⚽', chef: '👨‍🍳',
  scientist: '🔬', philosopher: '🤔', activist: '✊', journalist: '📰',
  model: '💃', director: '🎬', musician: '🎸', dancer: '💃', artist: '🎨',
  author: '📖', poet: '🖋️', businessman: '💼', entrepreneur: '🚀',
  host: '🎤', anchor: '📺', rapper: '🎤', producer: '🎬',
}

function guessEmoji(extract: string, name: string): string {
  const lower = extract.toLowerCase() + ' ' + name.toLowerCase()
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji
  }
  return '🎭'
}

function extractRole(text: string): string {
  const lines = text.split('.')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('He') && !trimmed.startsWith('She') && !trimmed.startsWith('They')) continue
    const roleMatch = trimmed.match(/is an? (.+?)(?:,| and|\.|$)/)
    if (roleMatch) return roleMatch[1].trim()
  }
  return 'Public figure'
}

function detectFromWikipediaData(title: string, extract: string, imageUrl?: string): DetectResult {
  const role = extractRole(extract)
  const first200 = extract.slice(0, 200)
  const style = `${title} is known for ${first200}. Speaks naturally as themselves — authentic, unscripted, and true to their real personality.`
  const emoji = guessEmoji(extract, title)
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]

  return { name: title, role, style, emoji, image: imageUrl, color }
}

export async function detectPerson(name: string): Promise<DetectResult | null> {
  const query = name.toLowerCase().trim()
  if (!query || query.length < 3) return null

  const local = findPersonality(name)
  if (local) {
    return {
      name: local.name,
      role: local.role,
      style: local.style,
      emoji: local.emoji,
      image: local.image,
      color: local.color || COLORS[Math.floor(Math.random() * COLORS.length)],
    }
  }

  try {
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!searchRes.ok) return null
    const searchData = await searchRes.json()
    const pages = searchData?.query?.search
    if (!pages || pages.length === 0) return null

    const pageTitle = pages[0].title

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!summaryRes.ok) return null
    const summary = await summaryRes.json()
    if (!summary || !summary.extract) return null

    const image = summary.thumbnail?.source || undefined

    return detectFromWikipediaData(summary.title, summary.extract, image)
  } catch {
    return null
  }
}
