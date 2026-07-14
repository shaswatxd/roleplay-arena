import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebate } from '../DebateContext'
import { PRESETS, CHAR_COLORS, EMOJI_OPTS } from '../data/presets'
import { PROVIDERS } from '../data/providers'
import { detectPerson } from '../utils/detector'
import type { Character } from '../data/presets'
import { avatarHtml } from '../utils/helpers'
import CharacterBioModal from './CharacterBioModal'

const QUICK_TOPICS = [
  'Should AI replace human creativity?',
  'Is social media destroying society?',
  'Should humans colonize Mars?',
  'Does money buy happiness?',
  'Is democracy the best system of governance?',
  'Should junk food be banned?',
]

export default function SetupScreen() {
  const { topic, setTopic, characters, togglePreset, removeCharacter, goTo, startDebate } = useDebate()

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="screen-active flex flex-col fixed inset-0 z-1"
    >
      <div className="flex items-center gap-3 px-5 pt-4 pb-0">
        <button onClick={() => goTo('landing')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-mono text-sm px-3 py-1.5 rounded-md transition-all duration-150 hover:bg-bg-glass border-none bg-none cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>
        <div className="font-sans text-lg font-semibold">Arena Setup</div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5 max-w-[560px] mx-auto w-full">
        <TopicSection topic={topic} setTopic={setTopic} />
        <CharactersSection
          characters={characters}
          togglePreset={togglePreset}
          removeCharacter={removeCharacter}
        />
        <SettingsSection />
      </div>

      <div className="px-5 py-4 pb-[calc(1rem+var(--safe-bottom,0px))] border-t border-border-default bg-bg-primary/90 backdrop-blur-md flex gap-3 max-w-[560px] mx-auto w-full">
        <button onClick={() => goTo('landing')} className="btn btn-secondary flex-[0_0_auto]">Back</button>
        <button onClick={startDebate} className="btn btn-primary flex-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Start Debate
        </button>
      </div>
    </motion.section>
  )
}

function TopicSection({ topic, setTopic }: { topic: string; setTopic: (t: string) => void }) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <SectionHeader icon="💬" title="Debate Topic" />
      <div className="flex flex-col gap-1.5">
        <label className="label">What should they argue about?</label>
        <textarea
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="textarea"
          placeholder="E.g. Should AI replace teachers? / Is social media destroying society? / Mars colonization: worth it?"
          rows={3}
        />
      </div>
      <div>
        <label className="label mb-1.5">Quick topics</label>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TOPICS.map(t => (
            <button key={t} onClick={() => setTopic(t)} className="btn btn-ghost btn-sm">{t.split('?')[0].length > 15 ? t.split('?')[0].slice(0, 15) + '...' : t.split('?')[0]}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function CharactersSection({
  characters, togglePreset, removeCharacter
}: {
  characters: Character[]
  togglePreset: (id: string) => void
  removeCharacter: (idx: number) => void
}) {
  const [showModal, setShowModal] = useState(false)
  const [bioChar, setBioChar] = useState<Character | null>(null)

  return (
    <div className="card p-5 flex flex-col gap-4">
      <SectionHeader icon="🎭" title="Characters" subtitle="(2–4)" />
      <div>
        <label className="label">Preset characters</label>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1.5 mt-1.5 sm:grid-cols-[repeat(auto-fill,minmax(80px,1fr))] sm:gap-2 max-h-[240px] overflow-y-auto scrollbar-none">
          {PRESETS.map(p => {
            const selected = characters.some(c => c.id === p.id)
            return (
              <motion.button
                key={p.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => togglePreset(p.id)}
                onContextMenu={e => { e.preventDefault(); setBioChar(p) }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-bg-glass border cursor-pointer transition-all duration-150 ${
                  selected ? 'border-accent bg-accent/10 shadow-[0_0_12px_rgba(124,58,237,0.1)]' : 'border-border-subtle hover:bg-bg-card-hover hover:border-border-default'
                }`}
              >
                <span className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                  dangerouslySetInnerHTML={{ __html: avatarHtml(p) }} />
                <span className="font-mono text-[0.625rem] text-text-tertiary text-center leading-tight max-w-full truncate">{p.name}</span>
              </motion.button>
            )
          })}
        </div>
        <div className="text-[0.625rem] text-text-tertiary mt-1.5 font-mono">Tap to select • Long-press for bio</div>
      </div>
      <div>
        <button onClick={() => setShowModal(true)} className="btn btn-ghost btn-sm w-full">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create custom character
        </button>
      </div>
      <SelectedCharacters characters={characters} onRemove={removeCharacter} />
      {showModal && <CustomCharModal onClose={() => setShowModal(false)} />}
      <AnimatePresence>
        {bioChar && <CharacterBioModal character={bioChar} onClose={() => setBioChar(null)} />}
      </AnimatePresence>
    </div>
  )
}

function SelectedCharacters({ characters, onRemove }: { characters: Character[]; onRemove: (idx: number) => void }) {
  return (
    <div>
      <label className="label">Selected <span className="text-accent-cyan">{characters.length}</span>/4</label>
      <div className="flex flex-col gap-2 min-h-[36px] mt-1">
        <AnimatePresence>
          {characters.length === 0 && (
            <div className="text-sm text-text-tertiary py-1">No characters selected yet.</div>
          )}
          {characters.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border-default relative overflow-hidden"
              style={{ background: c.color + '0d', borderColor: c.color + '33' }}
            >
              <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: c.color, borderRadius: '0 3px 3px 0' }} />
              <span className="w-7 h-7 rounded overflow-hidden flex items-center justify-center flex-shrink-0 text-xl"
                style={{ background: c.image ? c.color + '22' : 'none' }}
                dangerouslySetInnerHTML={{ __html: avatarHtml(c) }} />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-medium truncate" style={{ color: c.color }}>{c.name}</div>
                <div className="text-xs text-text-tertiary mt-px truncate">{c.role}</div>
              </div>
              <button onClick={() => onRemove(i)}
                className="bg-none border-none text-text-tertiary cursor-pointer p-1 rounded hover:text-error hover:bg-error-bg transition-all duration-150 text-base leading-none flex-shrink-0">
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function SettingsSection() {
  const { maxRounds, setMaxRounds, style, setStyle, length, setLength, language, setLanguage,
    activeProvider, setActiveProvider } = useDebate()

  const providerOpts: Record<string, string> = {}
  for (const p of PROVIDERS) {
    providerOpts[p.id] = p.name
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      <SectionHeader icon="⚙️" title="Debate Settings" />
      <div className="grid grid-cols-2 gap-3">
        <SettingsSelect label="Rounds" value={maxRounds} onChange={setMaxRounds} options={[2,3,4,5]} fmt={(v: number) => `${v} rounds`} />
        <SettingsSelect label="Style" value={style} onChange={setStyle}
          options={{ formal:'Formal debate', casual:'Casual discussion', aggressive:'Heated argument', socratic:'Socratic dialogue', comedy:'Comedy roast' } as Record<string, string>} />
      </div>
      <SettingsSelect label="Response length" value={length} onChange={setLength}
        options={{ short:'Short (1–2 sentences)', medium:'Medium (2–4 sentences)', long:'Long (paragraph)' } as Record<string, string>} />
      <SettingsSelect label="Language" value={language} onChange={setLanguage}
        options={{ english:'English', hinglish:'Hinglish (Hindi+English)', hindi:'Pure Hindi', urdu:'Urdu' } as Record<string, string>} />
      <SettingsSelect label="AI Provider" value={activeProvider} onChange={setActiveProvider}
        options={providerOpts} />
    </div>
  )
}

function SettingsSelect({ label, value, onChange, options, fmt }: {
  label: string
  value: string | number
  onChange: (v: any) => void
  options: Record<string, string> | (string | number)[]
  fmt?: (v: any) => string
}) {
  const entries = Array.isArray(options) ? options.map(v => [v, fmt ? fmt(v) : v] as [string | number, string]) : Object.entries(options)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-white/4 border border-border-default rounded-lg text-text-primary font-sans text-sm px-3.5 py-2.5 outline-none transition-all duration-150 focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12),0_0_20px_rgba(124,58,237,0.3)] appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1b0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: 36,
        }}>
        {entries.map(([k, v]) => <option key={String(k)} value={String(k)}>{v}</option>)}
      </select>
    </div>
  )
}

function CustomCharModal({ onClose }: { onClose: () => void }) {
  const { addCustomCharacter, characters } = useDebate()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [charStyle, setCharStyle] = useState('')
  const [emoji, setEmoji] = useState('🎭')
  const [color, setColor] = useState(CHAR_COLORS[0])
  const [image, setImage] = useState<string | undefined>(undefined)
  const [detected, setDetected] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (name.trim().length < 3) {
      setDetected(false)
      setDetecting(false)
      return
    }
    setDetecting(true)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const result = await detectPerson(name)
      if (result) {
        setRole(result.role)
        setCharStyle(result.style)
        setEmoji(result.emoji)
        setColor(result.color)
        setImage(result.image)
        setDetected(true)
      } else {
        setDetected(false)
      }
      setDetecting(false)
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [name])

  const handleAdd = () => {
    if (!name.trim()) return
    if (characters.length >= 4) return
    addCustomCharacter({ name: name.trim(), role: role.trim(), style: charStyle.trim(), emoji, color, image })
    onClose()
  }

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
        className="bg-bg-secondary border border-border-strong rounded-2xl sm:rounded-2xl rounded-b-none sm:rounded-b-2xl w-full max-w-[480px] max-h-[90dvh] overflow-y-auto p-6 pb-[calc(1.5rem+var(--safe-bottom,0px))] sm:pb-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <SectionHeader icon="✦" title="Custom Character" />
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {detected && image && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-success/25 bg-success/5">
              <img src={image} alt={name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-mono text-sm font-medium text-success">{name}</div>
                <div className="text-[0.6875rem] text-text-tertiary truncate">Auto-detected — fields pre-filled</div>
              </div>
            </div>
          )}
          <InputGroup label="Name">
            <div className="relative">
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input w-full" placeholder="e.g. Samay Raina, Elon Musk..." maxLength={40} />
              {detecting && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.625rem] font-mono text-text-tertiary bg-bg-glass px-2 py-0.5 rounded-full border border-border-subtle whitespace-nowrap">
                  ⟳ Detecting...
                </span>
              )}
              {detected && !detecting && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.625rem] font-mono text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20 whitespace-nowrap">
                  ✦ Detected
                </span>
              )}
            </div>
          </InputGroup>
          <InputGroup label="Emoji / Avatar">
            <div className="grid grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto p-0.5">
              {EMOJI_OPTS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`aspect-square rounded-md border cursor-pointer text-xl flex items-center justify-center transition-all duration-150 ${
                    emoji === e ? 'bg-accent/15 border-accent shadow-[0_0_8px_rgba(124,58,237,0.2)]' : 'border-border-subtle bg-bg-glass hover:bg-accent/15 hover:border-accent'
                  }`}>
                  {e}
                </button>
              ))}
            </div>
            <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)} className="input w-[72px] text-center text-xl" maxLength={2} />
          </InputGroup>
          <InputGroup label="Personality / Role">
            <input type="text" value={role} onChange={e => setRole(e.target.value)} className="input" placeholder="e.g. Tech billionaire, optimist, brutally honest" maxLength={80} />
          </InputGroup>
          <InputGroup label="Speaking style">
            <textarea value={charStyle} onChange={e => setCharStyle(e.target.value)} className="textarea" placeholder="e.g. Talks in short punchy statements. Often uses data. Dismisses emotions." rows={3} />
          </InputGroup>
          <InputGroup label="Accent color">
            <div className="flex gap-2">
              {CHAR_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  style={{ width: 32, height: 32, borderRadius: 8, background: c, border: color === c ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', transform: color === c ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s' }} />
              ))}
            </div>
          </InputGroup>
          <button onClick={handleAdd} className="btn btn-primary w-full">Add to Arena</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function InputGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 bg-accent/10 border border-accent/15">{icon}</div>
      <div className="font-sans text-[0.9375rem] font-semibold text-text-primary">{title}</div>
      {subtitle && <span className="font-mono text-[0.6875rem] text-text-tertiary font-normal">{subtitle}</span>}
    </div>
  )
}
