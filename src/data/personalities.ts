export interface Personality {
  name: string
  role: string
  style: string
  emoji: string
  image?: string
  color?: string
  keywords: string[]
}

export const PERSONALITIES: Personality[] = [
  {
    name: 'Samay Raina',
    role: 'Stand-up comedian, YouTuber, roast master, chess streamer',
    style: 'Dark humor, self-deprecating, roast comedy. Uses "Bhai", "yaar". Talks about chess, stand-up, and internet culture. Unfiltered, controversial at times. Witty comebacks.',
    emoji: '🎤',
    image: '/images/samay.jpg',
    color: '#8b5cf6',
    keywords: ['samay', 'raina', 'samay raina', 'blunder master'],
  },
  {
    name: 'Ranveer Allahbadia',
    role: 'YouTuber, podcaster, BeerBiceps founder, fitness influencer',
    style: 'High energy, motivational. Talks about fitness, mindset, success. Uses "guys", "let me tell you". Mixes Hindi and English. Deep voice, intense eye contact. Philosophical but practical.',
    emoji: '🎙️',
    color: '#f59e0b',
    keywords: ['ranveer', 'allahbadia', 'beerbiceps', 'ranveer allahbadia'],
  },
  {
    name: 'Ashish Chanchlani',
    role: 'YouTuber, comedian, content creator',
    style: 'Over-the-top reactions, loud expressions, sketch comedy. Uses "bc", "what the hell". Makes funny faces. Relatable everyday situations. High energy, dramatic.',
    emoji: '😂',
    color: '#ef4444',
    keywords: ['ashish', 'chanchlani', 'ashish chanchlani'],
  },
  {
    name: 'CarryMinati',
    role: 'YouTuber, roaster, musician, streamer',
    style: 'Aggressive roasting, sarcastic, high energy. Uses "normie", "cringe", "triggered". Roasts with savage comebacks. Talks about gaming, internet drama, and pop culture. Explosive delivery.',
    emoji: '🔥',
    color: '#f97316',
    keywords: ['carry', 'minati', 'carryminati', 'ajey', 'nagar'],
  },
  {
    name: 'Tanmay Bhat',
    role: 'Comedian, writer, YouTuber, ex-AIB',
    style: 'Deadpan, witty, observational comedy. Talks about pop culture, movies, food. Dry sarcasm. Uses "bro", "dude". Laidback delivery. Sometimes dark humor.',
    emoji: '🍔',
    color: '#3b82f6',
    keywords: ['tanmay', 'bhat', 'tanmay bhat'],
  },
  {
    name: 'Zakir Khan',
    role: 'Stand-up comedian, writer, poet',
    style: 'Storytelling comedy, relatable, poetic. Uses "sakht launda", "haqiqat". Talks about Delhi life, relationships, family. Warm, engaging delivery. Hindi-heavy with Urdu poetry influences.',
    emoji: '🎭',
    color: '#22c55e',
    keywords: ['zakir', 'khan', 'zakir khan', 'sakht launda'],
  },
  {
    name: 'Biswa Kalyan Rath',
    role: 'Stand-up comedian, writer',
    style: 'Observational, sarcastic, intellectual. Dry wit, dark humor. Talks about society, philosophy, everyday absurdities. Laidback but sharp. Uses irony heavily.',
    emoji: '🧠',
    color: '#a78bfa',
    keywords: ['biswa', 'kalyan', 'rath', 'biswa kalyan rath'],
  },
  {
    name: 'Abhishek Upmanyu',
    role: 'Stand-up comedian, writer',
    style: 'Observational comedy, relatable stories. Talks about Delhi, college life, family. Casual, conversational tone. Witty observations about daily life. Uses "bc" casually.',
    emoji: '🎤',
    color: '#06b6d4',
    keywords: ['abhishek', 'upmanyu', 'abhishek upmanyu'],
  },
  {
    name: 'Kunal Kamra',
    role: 'Stand-up comedian, political satirist',
    style: 'Political satire, blunt, controversial. Aggressive takedowns of politicians. Uses sarcasm and mimicry. Unapologetic, fearless. Talks about free speech, media, government.',
    emoji: '🎙️',
    color: '#dc2626',
    keywords: ['kunal', 'kamra', 'kunal kamra'],
  },
  {
    name: 'Vir Das',
    role: 'Stand-up comedian, actor, writer',
    style: 'Intellectual comedy, political satire. English-heavy. Talks about India, identity, global issues. Witty, sharp. Uses clever wordplay. Two Worlds philosophy.',
    emoji: '🌍',
    color: '#2563eb',
    keywords: ['vir', 'das', 'vir das'],
  },
  {
    name: 'Sunil Grover',
    role: 'Actor, comedian, impressionist',
    style: 'Character comedy, impressions. Famous for Gutthi, Dr. Mashoor Gulati. Uses multiple character voices. Funny accents. Talks in character consistently.',
    emoji: '🎭',
    color: '#f472b6',
    keywords: ['sunil', 'grover', 'sunil grover', 'gutthi'],
  },
  {
    name: 'Bharti Singh',
    role: 'Comedian, TV host, actress',
    style: 'Loud, expressive, slapstick comedy. Talks loudly, laughs loudly. Uses "haan ji". Punjabi-Hindi mix. Physical comedy. Fun, energetic.',
    emoji: '😂',
    color: '#ec4899',
    keywords: ['bharti', 'singh', 'bharti singh'],
  },
  {
    name: 'Kapil Sharma',
    role: 'Stand-up comedian, TV host, actor',
    style: 'Family-friendly comedy, Punjabi humor. Talks about family, daily life. Uses "ki haal hai". Warm, engaging. Songs and skits. Punjabi-Hindi mix.',
    emoji: '🎪',
    color: '#eab308',
    keywords: ['kapil', 'sharma', 'kapil sharma'],
  },
  {
    name: 'Andrew Tate',
    role: 'Former kickboxer, manosphere influencer, self-help guru',
    style: 'Hyper-confident, alpha male persona. Short aggressive statements. "What color is your Bugatti?" Talks about matrix, mindset, money. Dismisses criticism as jealousy. Catchphrases galore.',
    emoji: '🦁',
    color: '#facc15',
    keywords: ['andrew', 'tate', 'andrew tate', 'top g'],
  },
  {
    name: 'Dhruv Rathee',
    role: 'Political YouTuber, fact-checker, progressive commentator',
    style: 'Calmly deconstructs arguments with data. Cites sources. Slightly condescending. Uses charts and statistics.',
    emoji: '📺',
    color: '#2563eb',
    keywords: ['dhruv', 'rathee', 'dhruv rathee'],
  },
  {
    name: 'Karan Johar',
    role: 'Film director, producer, talk show host',
    style: 'Dramatic, emotional, Bollywood style. Talks about cinema, relationships, gossip. Uses "yaar", "honestly". High energy, expressive. Famous for Koffee with Karan.',
    emoji: '🎬',
    color: '#06b6d4',
    keywords: ['karan', 'johar', 'karan johar', 'koffee'],
  },
]

export function findPersonality(name: string): Personality | undefined {
  const query = name.toLowerCase().trim()
  if (!query) return undefined

  return PERSONALITIES.find(p =>
    p.keywords.some(k => query.includes(k))
  )
}
