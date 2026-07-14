import { motion } from 'framer-motion'
import { avatarHtml } from '../utils/helpers'
import type { Character } from '../data/presets'

const SAMPLE_QUOTES: Record<string, string[]> = {
  'samay': ['Ye toh blunder hai bhai', 'Checkmate kar diya soch ko', 'Chess mein aur life mein dono mein L lagne wale hain'],
  'ranveer': ['So guys, let me tell you something', 'The real question is — are you disciplined enough?', 'Your mindset is your biggest asset bhai'],
  'ashish': ['YEH KYA DEKH LIYA BC!', 'Guys guys guys — imagine karo ye hota', 'What the hell yaar ye toh next level hai'],
  'carry': ['Toh kaise hain aap log', 'Yeh kya dekh liya — CRINGE', 'Normie ho tum sab, triggered mat ho'],
  'tanmay': ['Hmm interesting... mujhe kya main toh khana kha raha hoon', 'Bro ye toh savage hai', 'Okay fair enough... but vada pav kab khayenge?'],
  'zakir': ['Sakht launda wo hota hai jo... haqiqat jaanta hai', 'Yaar duniya mein sabse bada dard hai...', 'Chai piyo aur soch lo'],
  'biswa': ['Ek minute ruko... ab suno', 'Hmm ye toh interesting hai, lekin galat hai', 'Dekho bhai,逻辑 se samjho'],
  'upmanyu': ['Yaar ek baar mujhe hua tha...', 'BC ye toh relatable hai', 'Delhi mein sabse bada problem ye hai...'],
  'kunal': ['Achha toh matlab...?', 'Ye jo hai na, fascism hai seedha', 'Freedom of speech khatam ho gayi hai'],
  'vir': ['Here\'s the thing about India — we have two of everything', 'Bhai ye toh global problem hai', 'The duality is fascinating'],
  'sunil': ['Arre waah! Kya baat hai!', 'Gutthi kehti hai ki...', 'Dr. Mashoor Gulati ka diagnosis hai ye'],
  'bharti': ['HAHAHAHA haan ji suniye toh', 'Arre bhai ye toh hilarious hai', 'Oye ye kya ho raha hai'],
  'kapil': ['Ki haal hai ji? Agge boliye', 'Arre yaar ye toh comedy ban gaya', 'Ha ha ha — ye toh Kapil Sharma Show pe hona chahiye'],
  'tate': ['What color is your Bugatti?', 'The Matrix has you bhai', 'Imagine being this poor — couldn\'t be me'],
  'dhruv': ['Dekhiye, facts check kijiye', 'Aur sabse important baat — data ye kehta hai', 'Educational video hai ye, dhyan se suno'],
  'karan': ['Honestly? OH MY GOD ye toh drama hai', 'Darling, cinema mein sab chalta hai', 'Yaar mujhe lagta hai ki... this is just wrong'],
}

export default function CharacterBioModal({ character, onClose }: { character: Character; onClose: () => void }) {
  const quotes = SAMPLE_QUOTES[character.id] || [
    character.style.split('.')[0] + '.',
    character.role + '.',
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-500 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 40, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-bg-secondary border border-border-strong rounded-2xl rounded-b-none sm:rounded-2xl w-full max-w-[480px] max-h-[85dvh] overflow-y-auto p-6 pb-[calc(1.5rem+var(--safe-bottom,0px))] sm:pb-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="font-sans text-lg font-semibold">Character Bio</div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center text-3xl flex-shrink-0 border-2"
              style={{ background: character.color + '15', borderColor: character.color + '44' }}
              dangerouslySetInnerHTML={{ __html: avatarHtml(character) }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-sans text-xl font-bold" style={{ color: character.color }}>{character.name}</div>
              <div className="text-sm text-text-secondary mt-0.5">{character.role}</div>
            </div>
          </div>

          <div className="bg-bg-glass border border-border-subtle rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">🗣️</span>
              <span className="font-mono text-xs font-medium text-text-secondary uppercase tracking-wider">Speaking Style</span>
            </div>
            <div className="text-sm leading-relaxed text-text-primary">{character.style}</div>
          </div>

          <div className="bg-bg-glass border border-border-subtle rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">💬</span>
              <span className="font-mono text-xs font-medium text-text-secondary uppercase tracking-wider">Signature Lines</span>
            </div>
            <div className="flex flex-col gap-2">
              {quotes.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-accent text-xs mt-0.5">▸</span>
                  <span className="text-sm text-text-primary italic">"{q}"</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onClose} className="btn btn-primary w-full">Close</button>
        </div>
      </motion.div>
    </motion.div>
  )
}
