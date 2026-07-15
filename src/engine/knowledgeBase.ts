import type { CharacterDNA, VerifiedQuote } from './characterDNA'

const STOPWORDS = new Set(['the', 'a', 'an', 'is', 'are', 'of', 'to', 'and', 'in', 'on', 'for', 'should', 'be', 'this', 'that', 'vs', 'or'])

export function keywordsOf(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOPWORDS.has(w))
}

/**
 * Lightweight keyword-overlap retrieval over each character's curated, verified quotes.
 * Not embeddings/vector search (no backend exists) — see plan's scope note. Returns [] when
 * nothing overlaps so the prompt layer can be omitted entirely (keeps tokens low).
 */
export function retrieveKnowledge(dna: CharacterDNA, topic: string, recentText: string): VerifiedQuote[] {
  const quotes = dna.verifiedQuotes
  if (!quotes || quotes.length === 0) return []

  const queryWords = new Set([...keywordsOf(topic), ...keywordsOf(recentText)])
  if (queryWords.size === 0) return quotes.slice(0, 1)

  const scored = quotes
    .map(q => {
      const quoteWords = keywordsOf(q.text)
      const overlap = quoteWords.filter(w => queryWords.has(w)).length
      return { q, overlap }
    })
    .sort((a, b) => b.overlap - a.overlap)

  const best = scored.filter(s => s.overlap > 0).map(s => s.q)
  return best.length > 0 ? best.slice(0, 2) : quotes.slice(0, 1)
}
