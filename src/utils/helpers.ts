import type { Character } from '../data/presets'

export function avatarHtml(c: Partial<Character>): string {
  if (c?.image) {
    return `<img class="char-img-avatar" src="${c.image}" alt="${c.name}" loading="lazy">`
  }
  return c?.emoji || '🎭'
}

export function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
}

export function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}
