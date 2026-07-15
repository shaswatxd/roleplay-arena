import { motion } from 'framer-motion'
import { avatarHtml } from '../utils/helpers'
import type { Character } from '../data/presets'
import { getDNA } from '../engine/dnaRegistry'

export default function CharacterBioModal({ character, onClose }: { character: Character; onClose: () => void }) {
  const dna = getDNA(character)
  const quotes = dna.favoritePhrases.length > 0
    ? dna.favoritePhrases
    : [character.style.split('.')[0] + '.', character.role + '.']
  const traits: [string, number][] = [
    ['Confidence', dna.traits.confidence],
    ['Aggression', dna.traits.aggression],
    ['Humor', dna.traits.humor],
    ['Sarcasm', dna.traits.sarcasm],
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

          <div className="bg-bg-glass border border-border-subtle rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">📊</span>
              <span className="font-mono text-xs font-medium text-text-secondary uppercase tracking-wider">Traits</span>
            </div>
            <div className="flex flex-col gap-2">
              {traits.map(([label, value]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-xs text-text-tertiary w-20 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, background: character.color }} />
                  </div>
                  <span className="text-[0.6875rem] font-mono text-text-tertiary w-7 text-right flex-shrink-0">{value}</span>
                </div>
              ))}
            </div>
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
