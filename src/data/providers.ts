export interface AIProvider {
  id: string
  name: string
  endpoint: string
  model: string
  keyField: string
}

export const PROVIDERS: AIProvider[] = [
  {
    id: 'groq',
    name: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant',
    keyField: 'groqKey',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'openai/gpt-oss-20b:free',
    keyField: 'openrouterKey',
  },
]
