import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebate } from '../DebateContext'
import type { Character, Message } from '../types'
import { avatarHtml, escapeHtml } from '../utils/helpers'
import { buildContext, callAI } from '../utils/groq'

interface LocalMessage {
  charId: string
  name?: string
  emoji?: string
  image?: string
  color?: string
  round: number
  text: string
}

export default function ArenaScreen() {
  const { topic, characters, maxRounds, style, length, language, apiKeys, activeProvider,
    setMessages, setCurrentRound, setIsRunning, setIsPaused, setDebateComplete,
    goTo, finishDebate } = useDebate()

  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([])
  const [currentRound, setLocalRound] = useState(0)
  const [isRunning, setLocalRunning] = useState(false)
  const [isPaused, setLocalPaused] = useState(false)
  const [typingChar, setTypingChar] = useState<Character | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight
    })
  }, [])

  useEffect(() => { scrollToBottom() }, [localMessages, typingChar, scrollToBottom])

  async function runRound() {
    if (pausedRef.current) return

    setLocalRound(prev => {
      const next = prev + 1
      if (next > maxRounds) {
        setLocalRunning(false)
        setDebateComplete(true)
        setMessages(localMessages as Message[])
        setCurrentRound(maxRounds)
        finishDebate()
        return prev
      }
      return next
    })
  }

  useEffect(() => {
    if (currentRound > 0 && currentRound <= maxRounds) {
      generateRound(currentRound)
    }
  }, [currentRound])

  async function generateRound(round: number) {
    setLocalRunning(true)
    addSysMessage(`⚔️ Round ${round} of ${maxRounds}`)

    for (const char of characters) {
      if (pausedRef.current) break
      setTypingChar(char)
      const ctx = buildContext(char, topic, round, maxRounds, style, length, language, localMessages as Message[])
      try {
        const { text } = await callAI(ctx, apiKeys, activeProvider)
        const msg: LocalMessage = { charId: char.id, name: char.name, emoji: char.emoji, image: char.image, color: char.color, round, text }
        setLocalMessages(prev => [...prev, msg])
      } catch (err) {
        addSysMessage('⚠️ Error: API failed — check your keys')
        pausedRef.current = true
        setLocalPaused(true)
        break
      }
      setTypingChar(null)
      await delay(300)
    }

    setTypingChar(null)
    setLocalRunning(false)
  }

  function addSysMessage(text: string) {
    setLocalMessages(prev => [...prev, { charId: 'sys', text, round: currentRound }])
  }

  const nextRound = () => {
    if (currentRound >= maxRounds) {
      setMessages(localMessages as Message[])
      setCurrentRound(maxRounds)
      setDebateComplete(true)
      finishDebate()
    } else {
      runRound()
    }
  }

  const togglePause = () => {
    setLocalPaused(prev => {
      const next = !prev
      pausedRef.current = next
      return next
    })
  }

  const progress = currentRound > 0 ? ((currentRound - 1) / maxRounds) * 100 : 0

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="screen-active flex flex-col fixed inset-0 z-1"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-default bg-bg-primary/85 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => {/* confirm exit */}} className="btn btn-ghost btn-icon btn-sm" aria-label="Exit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[0.6875rem] font-medium tracking-wider uppercase text-text-tertiary block mb-0.5">Topic</span>
          <div className="truncate text-text-primary text-sm font-medium">{topic}</div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 font-mono text-xs text-accent-light whitespace-nowrap flex-shrink-0">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-accent"
            animate={isRunning ? { opacity: [1, 0.5, 1], scale: [1, 0.8, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          R{currentRound}/{maxRounds}
        </div>
      </div>

      <div className="flex gap-2 px-4 py-2 border-b border-border-subtle bg-bg-primary/50 overflow-x-auto scrollbar-none">
        {characters.map(c => (
          <div key={c.id} className="flex flex-col items-center gap-0.5 flex-shrink-0 cursor-pointer px-1.5 py-1 rounded-md hover:bg-bg-glass transition-colors duration-150">
            <motion.div
              className="w-[38px] h-[38px] rounded-lg overflow-hidden flex items-center justify-center text-xl border-2 border-transparent"
              style={{ background: c.color + '15', borderColor: c.color + '33' }}
              animate={typingChar?.id === c.id ? { boxShadow: [`0 0 0 0 ${c.color}00`, `0 0 0 8px ${c.color}15`, `0 0 0 0 ${c.color}00`] } : {}}
              transition={{ duration: 1.2, repeat: typingChar?.id === c.id ? Infinity : 0, ease: 'easeInOut' }}
              dangerouslySetInnerHTML={{ __html: avatarHtml(c) }}
            />
            <div className="font-mono text-[0.5625rem] text-text-tertiary max-w-[48px] text-center truncate">{c.name.split(' ')[0]}</div>
          </div>
        ))}
      </div>

      <div ref={feedRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth">
        <AnimatePresence>
          {localMessages.map((msg, i) => {
            if (msg.charId === 'sys') {
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center font-mono text-[0.6875rem] text-text-tertiary tracking-wide py-1 flex items-center gap-3 before:flex-1 before:h-px before:bg-border-subtle after:flex-1 after:h-px after:bg-border-subtle">
                  {msg.text}
                </motion.div>
              )
            }
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-xl flex-shrink-0 border-2 border-white/6" style={{ background: msg.color + '15', borderColor: msg.color + '44' }}
                  dangerouslySetInnerHTML={{ __html: avatarHtml(msg) }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-mono text-sm font-medium" style={{ color: msg.color }}>{msg.name}</span>
                    <span className="font-mono text-[0.625rem] text-text-tertiary">R{msg.round}</span>
                  </div>
                  <div className="px-4 py-3 rounded-tr-lg rounded-br-lg rounded-bl-lg bg-white/4 border border-border-subtle text-sm leading-relaxed text-text-primary" style={{ borderLeft: `3px solid ${msg.color}` }} dangerouslySetInnerHTML={{ __html: escapeHtml(msg.text) }} />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {typingChar && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-xl flex-shrink-0 border-2 border-white/6" style={{ background: typingChar.color + '15', borderColor: typingChar.color + '44' }}
              dangerouslySetInnerHTML={{ __html: avatarHtml(typingChar) }} />
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-mono text-sm font-medium" style={{ color: typingChar.color }}>{typingChar.name}</span>
              </div>
              <div className="inline-flex gap-1 px-4 py-3 rounded-tr-lg rounded-br-lg rounded-bl-lg bg-white/4 border border-border-subtle" style={{ borderLeft: `3px solid ${typingChar.color}` }}>
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-text-tertiary"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="px-4 py-3 pb-[calc(0.75rem+var(--safe-bottom,0px))] border-t border-border-default bg-bg-primary/90 backdrop-blur-md flex flex-col gap-2">
        <div className="h-0.5 rounded-full bg-white/4 overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-cyan" animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={togglePause} className="btn btn-secondary btn-sm flex-[0_0_auto]">
            {isPaused ? (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Resume</>
            ) : (
              <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</>
            )}
          </button>
          <button onClick={nextRound} disabled={isRunning} className="btn btn-primary flex-1 disabled:opacity-35 disabled:cursor-not-allowed">
            {currentRound >= maxRounds ? '🏁 Finish Debate' : (
              <>Next Round <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
            )}
          </button>
          <button onClick={() => {}} className="btn btn-secondary btn-icon btn-sm" aria-label="Export" title="Export">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>
    </motion.section>
  )
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
