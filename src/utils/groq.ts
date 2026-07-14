import type { Character, Message } from '../types'
import { PROVIDERS } from '../data/providers'
import type { AIProvider } from '../data/providers'

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
  hinglish: 'Respond in Hinglish — natural mix of Hindi and English, like how urban Indians text. Use Devanagari Hindi words written in Roman script mixed with English. Be natural, not forced. Example: "yaar ye toh bohot galat hai bhai, tu soch ke bol na" — NOT "यह बहुत गलत है (this is very wrong)". Never write Hindi in Devanagari script for Hinglish mode.',
  hindi:    'पूरा जवाब Hindi में दो। Respond entirely in Hindi (Roman script is fine).',
  urdu:     'Respond in Urdu (Roman script). Use natural Urdu expressions.',
}

export function buildContext(
  char: Character,
  topic: string,
  currentRound: number,
  maxRounds: number,
  style: string,
  length: string,
  language: string,
  messages: Message[]
): string {
  const prevMessages = messages.slice(-8).map(m => `${m.name}: "${m.text}"`).join('\n')

  const langRule = langMap[language] || langMap.hinglish

  const charExample = getCharExample(char.name)

  return `ROLEPLAY: You are EXACTLY ${char.name}. ${char.role}.
YOUR VOICE: ${char.style || 'Natural and authentic.'}

EXAMPLE OF HOW YOU SPEAK:
${charExample}

DEBATE FORMAT: ${styleMap[style] || styleMap.casual}
TOPIC: "${topic}"
ROUND: ${currentRound} of ${maxRounds}

${prevMessages ? `WHAT OTHERS SAID:\n${prevMessages}\n\nNow respond to what they said.` : 'You are speaking first on this topic.'}

STRICT RULES — BREAKING THESE RUINS THE DEBATE:
1. You ARE ${char.name}. Speak ONLY as them. Never break character.
2. Every sentence must relate to the topic: "${topic}"
3. React to what others said — argue, roast, agree, counter. Don't give monologues.
4. Use your REAL catchphrases, speech patterns, and way of talking from the example above.
5. NO English translations in brackets. NO "(translation)". Just pure natural dialogue.
6. NO fake apps, fake policies, or made-up incidents. Stay real.
7. NO "I cannot respond" or "As an AI". You are a real person in this debate.
8. Keep it ${lengthMap[length] || lengthMap.medium}
${currentRound === maxRounds ? '9. FINAL ROUND — make your strongest closing argument.' : ''}

LANGUAGE: ${langRule}
Now respond as ${char.name}:`
}

function getCharExample(name: string): string {
  const examples: Record<string, string> = {
    'Samay Raina': '"Arre yaar, ye toh blunder hai bhai. Chess mein bhi aur life mein bhi. Tera argument ka rating 800 hai, mere chess se bhi kam."',
    'Ranveer Allahbadia': '"So guys, let me tell you something. The real question is — are you disciplined enough to even understand this topic? Trust me bhai, mindset sabse bada weapon hai."',
    'Ashish Chanchlani': '"YEH KYA DEKH LIYA BC! Arre guys guys guys — imagine karo ki ye topic ek sketch hai aur hum sab isme fas gaye. What the hell yaar!"',
    'CarryMinati': '"Toh kaise hain aap log? Aaj ka topic dekh ke maine socha — ye toh CRINGE hai bhai. Normie log ispe argue karte hain, main toh seedha point pe aata hoon."',
    'Tanmay Bhat': '"Hmm interesting. Mujhe kya, main toh khana kha raha hoon. Lekin agar tu bol raha hai toh sun — vada pav ki tarah ye topic bhi hai, sabke muh mein rehta hai."',
    'Zakir Khan': '"Sakht launda wo hota hai jo haqiqat jaanta hai. Yaar duniya mein sabse bada dard hai — jab log bina samjhe bolte hain. Chai piyo aur soch lo."',
    'Biswa Kalyan Rath': '"Ek minute ruko. Ab suno. Dekho bhai, ye jo tum bol rahe ho na — ye toh galat hai. Logic se samjho, emotions se nahi."',
    'Abhishek Upmanyu': '"Yaar ek baar mujhe hua tha — exact ye topic pe. BC ye toh relatable hai. Delhi mein sabse bada problem ye hai ki log bina soche bolte hain."',
    'Kunal Kamra': '"Achha toh matlab... ye jo hai na, seedha fascism hai. Freedom of speech khatam ho gayi hai agar tum ye nahi samajh sakte."',
    'Vir Das': '"Here\'s the thing about India — we have two of everything. Aur ye topic bhi usi ka hissa hai. Bhai ye toh global problem hai."',
    'Sunil Grover': '"Arre waah! Kya baat hai! Gutthi kehti hai ki ye toh sabse bada mudda hai. Dr. Mashoor Gulati ka diagnosis hai — ye topic chronic hai."',
    'Bharti Singh': '"HAHAHAHA haan ji suniye toh! Arre bhai ye toh hilarious hai. Oye ye kya ho raha hai — mujhe toh hasi aa rahi hai ye sun ke."',
    'Kapil Sharma': '"Ki haal hai ji? Agge boliye. Arre yaar ye toh comedy ban gaya. Ha ha ha — ye toh Kapil Sharma Show pe hona chahiye tha."',
    'Andrew Tate': '"What color is your Bugatti? The Matrix has you bhai. Imagine being this poor — couldn\'t be me. Ye topic hai hi nahi, ye toh mindset ka khel hai."',
    'Dhruv Rathee': '"Dekhiye, facts check kijiye. Aur sabse important baat — data ye kehta hai. Educational video hai ye, dhyan se suno. Numbers jhooth nahi bolte."',
    'Karan Johar': '"Honestly? OH MY GOD ye toh drama hai. Darling, cinema mein sab chalta hai lekin ye topic — ye toh real life ka blockbuster hai."',
  }
  return examples[name] || `"I am ${name} and this is my authentic voice."`
}

export async function callProvider(
  provider: AIProvider,
  prompt: string,
  apiKey: string
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
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.92,
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
  prompt: string,
  apiKeys: Record<string, string>,
  preferredId?: string
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
      const text = await callProvider(provider, prompt, apiKeys[provider.keyField])
      return { text, providerId: provider.id }
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastErr || new Error('All providers failed')
}
