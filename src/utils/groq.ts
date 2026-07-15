import type { ChatMessage } from '../types'
import { PROVIDERS } from '../data/providers'
import type { AIProvider } from '../data/providers'

export async function callProvider(
  provider: AIProvider,
  messages: ChatMessage[],
  apiKey: string,
  temperature = 0.9
): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const res = await fetch(provider.endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
        ...(provider.id === 'openrouter' ? { 'HTTP-Referer': 'https://roleplay-arena.app', 'X-Title': 'RolePlay Arena' } : {}),
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        max_tokens: 500,
        temperature,
      }),
    })
    clearTimeout(timeout)
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: 'Unknown error' } }))
      throw new Error(err?.error?.message || `HTTP ${res.status}`)
    }
    const data = await res.json()
    const msg = data?.choices?.[0]?.message
    let text = msg?.content
    if (!text && msg?.reasoning) {
      const lines = msg.reasoning.split('\n').filter((l: string) => !l.includes('The user wants') && !l.includes('We need to') && !l.includes('Let me') && !l.includes('I will') && !l.includes('Must ensure') && !l.includes('Check constraints') && !l.includes('Provide') && !l.includes('Potential'))
      text = lines.join('\n')
    }
    return text?.trim() || '...'
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('API timeout — server took too long to respond')
    }
    throw err
  }
}

export async function callAI(
  messages: ChatMessage[],
  apiKeys: Record<string, string>,
  preferredId?: string,
  temperature = 0.9
): Promise<{ text: string; providerId: string }> {
  const available = PROVIDERS.filter(p => apiKeys[p.keyField]?.trim())
  if (available.length === 0) {
    throw new Error('No API keys configured for any provider')
  }

  if (preferredId) {
    const preferred = available.find(p => p.id === preferredId)
    if (preferred) {
      available.splice(available.indexOf(preferred), 1)
      available.unshift(preferred)
    }
  }

  let lastErr: Error | null = null
  for (const provider of available) {
    try {
      const text = await callProvider(provider, messages, apiKeys[provider.keyField], temperature)
      return { text, providerId: provider.id }
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastErr || new Error('All providers failed')
}
