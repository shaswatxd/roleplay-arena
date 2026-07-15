import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDebate } from '../DebateContext'
import { avatarHtml } from '../utils/helpers'
import { callAI } from '../utils/groq'
import { judgeDebate } from '../engine/judge'
import type { JudgeResult } from '../engine/judge'

export default function ResultsScreen() {
  const { topic, characters, messages, maxRounds, style, length, language, apiKeys, activeProvider, goTo } = useDebate()
  const [summary, setSummary] = useState('')
  const [winner, setWinner] = useState<string | null>(null)
  const [showWinner, setShowWinner] = useState(false)
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null)
  const [judging, setJudging] = useState(false)
  const [judgeError, setJudgeError] = useState('')

  useEffect(() => {
    generateSummary()
  }, [])

  async function generateSummary() {
    const transcript = messages.map(m => `${m.name}: "${m.text}"`).join('\n')
    const prompt = `Below is a debate transcript about "${topic}". Write a 3-4 sentence summary of who argued what, what the key points were, and who made the most compelling arguments. Be specific and fair. Write in ${language === 'hinglish' ? 'Hinglish (Hindi+English mix)' : language}.

Transcript:
${transcript}`
    try {
      const { text } = await callAI([{ role: 'user', content: prompt }], apiKeys, activeProvider)
      setSummary(text)
    } catch {
      setSummary('Summary generation failed. You can still export the full transcript.')
    }
  }

  async function runJudge() {
    setJudging(true)
    setJudgeError('')
    try {
      const result = await judgeDebate(topic, characters, messages, apiKeys, activeProvider)
      setJudgeResult(result)
    } catch (err) {
      setJudgeError(err instanceof Error ? err.message : 'Judge failed to score this debate.')
    } finally {
      setJudging(false)
    }
  }

  const handleVote = (charId: string) => {
    setWinner(charId)
    setShowWinner(true)
  }

  const winnerChar = characters.find(c => c.id === winner)
  const judgeSuggestedChar = judgeResult?.suggestedWinner ? characters.find(c => c.id === judgeResult.suggestedWinner) : undefined

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="screen-active flex flex-col flex-1 p-6 gap-5 overflow-y-auto pb-[calc(1.5rem+var(--safe-bottom,0px))]"
    >
      <div className="text-center py-6 pb-4">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="text-5xl block mb-4"
        >🏆</motion.span>
        <h2 className="font-sans text-3xl font-extrabold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">Debate Complete</span>
        </h2>
        <div className="text-sm text-text-secondary max-w-[360px] mx-auto">
          &ldquo;{topic}&rdquo; — {characters.length} characters, {maxRounds} rounds
        </div>
      </div>

      <div className="bg-gradient-to-br from-accent/10 to-accent-cyan/5 border border-accent/15 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 bg-accent/15">📝</div>
          <div className="font-sans text-[0.9375rem] font-semibold text-text-primary">AI Summary</div>
        </div>
        <div className="text-sm leading-relaxed text-text-secondary">
          {summary || <span className="text-text-tertiary">Generating AI summary...</span>}
        </div>
      </div>

      <div className="bg-bg-card border border-border-default rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 bg-accent/15">⚖️</div>
            <div className="font-sans text-[0.9375rem] font-semibold text-text-primary">Debate Judge</div>
          </div>
          {!judgeResult && (
            <button onClick={runJudge} disabled={judging} className="btn btn-secondary btn-sm disabled:opacity-50">
              {judging ? 'Judging...' : 'Judge This Debate'}
            </button>
          )}
        </div>
        {judgeError && <div className="text-sm text-error">{judgeError}</div>}
        {judgeResult && (
          <div className="flex flex-col gap-3">
            {characters.map(c => {
              const score = judgeResult.scores[c.id]
              if (!score) return null
              const fields = ['logic', 'evidence', 'persuasiveness', 'consistency', 'historicalAuthenticity'] as const
              const total = fields.reduce((sum, f) => sum + (score[f] || 0), 0) / fields.length
              return (
                <div key={c.id} className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg bg-bg-glass border border-border-subtle">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-medium" style={{ color: c.color }}>{c.name}</span>
                    <span className="font-mono text-xs text-text-tertiary">{total.toFixed(0)}/100 avg</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {fields.map(f => (
                      <div key={f} title={f} className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${score[f] || 0}%`, background: c.color }} />
                      </div>
                    ))}
                  </div>
                  {score.fallacies && score.fallacies.length > 0 && (
                    <div className="text-[0.6875rem] text-text-tertiary">Fallacies noted: {score.fallacies.join(', ')}</div>
                  )}
                </div>
              )
            })}
            {judgeResult.notes && <div className="text-sm text-text-secondary italic">{judgeResult.notes}</div>}
            {judgeResult.closeCall || !judgeSuggestedChar ? (
              <div className="text-sm text-text-tertiary font-mono">Too close to call.</div>
            ) : (
              <div className="text-sm font-medium" style={{ color: judgeSuggestedChar.color }}>Judge's pick: {judgeSuggestedChar.name}</div>
            )}
          </div>
        )}
      </div>

      <div className="bg-bg-card border border-border-default rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 bg-accent/15">🎭</div>
          <div className="font-sans text-[0.9375rem] font-semibold text-text-primary">Character Stats</div>
        </div>
        <div className="flex flex-col gap-2">
          {characters.map(c => {
            const msgs = messages.filter(m => m.charId === c.id)
            const totalWords = msgs.reduce((acc, m) => acc + (m.text ? m.text.split(/\s+/).length : 0), 0)
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 px-3 py-3 rounded-lg bg-bg-glass border border-border-subtle hover:bg-bg-card-hover hover:border-border-default transition-all duration-150"
              >
                <span className="w-9 h-9 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0 text-2xl" style={{ background: c.image ? c.color + '22' : 'none' }} dangerouslySetInnerHTML={{ __html: avatarHtml(c) }} />
                <div className="flex-1">
                  <div className="font-mono text-sm font-medium" style={{ color: c.color }}>{c.name}</div>
                  <div className="text-xs text-text-tertiary mt-px">{c.role}</div>
                </div>
                <div className="font-mono text-xs text-text-tertiary text-right flex-shrink-0 leading-relaxed">{msgs.length} turns<br />{totalWords} words</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="bg-bg-card border border-border-default rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 bg-accent/15">🗳️</div>
          <div className="font-sans text-[0.9375rem] font-semibold text-text-primary">Who Won?</div>
        </div>
        {!showWinner ? (
          <div className="flex flex-col gap-2">
            <div className="text-sm text-text-secondary mb-1">Cast your vote — who argued best?</div>
            {characters.map(c => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVote(c.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-glass border border-border-subtle hover:bg-bg-card-hover hover:border-border-default transition-all duration-150 cursor-pointer text-left"
              >
                <span className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: c.color + '15' }}
                  dangerouslySetInnerHTML={{ __html: avatarHtml(c) }} />
                <div className="flex-1">
                  <div className="font-mono text-sm font-medium" style={{ color: c.color }}>{c.name}</div>
                  <div className="text-xs text-text-tertiary mt-px">{c.role}</div>
                </div>
                <div className="text-accent text-lg">▸</div>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="text-5xl"
            >🏆</motion.div>
            <div className="font-sans text-xl font-bold" style={{ color: winnerChar?.color }}>{winnerChar?.name}</div>
            <div className="text-sm text-text-secondary">Your pick for the winner!</div>
            <button onClick={() => { setWinner(null); setShowWinner(false) }} className="btn btn-ghost btn-sm text-text-tertiary">Change vote</button>
          </motion.div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <button onClick={() => shareTranscript()} className="btn btn-secondary btn-sm flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
          <button onClick={() => copyTranscript()} className="btn btn-secondary btn-sm flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
          <button onClick={() => exportTxt()} className="btn btn-secondary btn-sm flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
        <button onClick={() => goTo('setup')} className="btn btn-primary w-full">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          New Debate
        </button>
        <button onClick={() => {/*rematch*/}} className="btn btn-secondary w-full">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Rematch (same topic)
        </button>
      </div>
    </motion.section>
  )

  function buildTranscript() {
    const lines = [
      `ROLEPLAY ARENA — DEBATE TRANSCRIPT`,
      `Topic: ${topic}`,
      `Date: ${new Date().toLocaleString()}`,
      `Characters: ${characters.map(c => c.name).join(', ')}`,
      `Rounds: ${maxRounds} | Style: ${style}`,
      `${'─'.repeat(60)}`,
      '',
    ]
    let lastRound = 0
    for (const msg of messages) {
      if (!msg.charId || msg.charId === 'sys') continue
      if (msg.round !== lastRound) {
        lines.push(`\n═══ Round ${msg.round} ═══\n`)
        lastRound = msg.round
      }
      lines.push(`${msg.emoji} ${msg.name}:`)
      lines.push(msg.text)
      lines.push('')
    }
    if (summary) {
      lines.push(`${'─'.repeat(60)}`)
      lines.push('AI SUMMARY:')
      lines.push(summary)
    }
    return lines.join('\n')
  }

  function copyTranscript() {
    const text = buildTranscript()
    navigator.clipboard.writeText(text).then(() => {
      // toast
    }).catch(() => {})
  }

  function exportTxt() {
    const text = buildTranscript()
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debate-${slugify(topic)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function slugify(str: string) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
  }

  function shareTranscript() {
    const text = buildTranscript()
    if (navigator.share) {
      navigator.share({ title: `Debate: ${topic}`, text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Debate copied to clipboard!')
      }).catch(() => {})
    }
  }
}
