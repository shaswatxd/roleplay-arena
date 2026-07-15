import { motion } from 'framer-motion'
import { useDebate } from '../DebateContext'

export default function LandingScreen() {
  const { goTo } = useDebate()

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="screen-active flex flex-col flex-1 items-center justify-center p-6 min-h-dvh"
    >
      <div className="w-full max-w-[440px] flex flex-col gap-8 relative z-1">
        <div className="text-center">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
              border: '1px solid rgba(124,58,237,0.25)',
            }}
            animate={{ boxShadow: [
              '0 0 40px rgba(124,58,237,0.15)',
              '0 0 60px rgba(124,58,237,0.25), 0 0 80px rgba(6,182,212,0.1)',
              '0 0 40px rgba(124,58,237,0.15)',
            ]}}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="absolute -inset-0.5 rounded-2xl z-[-1] opacity-40"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, transparent, #06b6d4)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-4xl">⚔️</span>
          </motion.div>

          <h1 className="font-sans font-extrabold leading-[1.1] tracking-tight mb-3"
            style={{ fontSize: 'clamp(2.2rem, 8vw, 3.2rem)' }}>
            <span className="bg-gradient-to-r from-white via-accent-light to-accent-cyan bg-clip-text text-transparent">
              RolePlay Arena
            </span>
          </h1>

          <p className="text-text-secondary text-base leading-relaxed max-w-[360px] mx-auto">
            AI characters debate any topic — real personalities, real arguments, zero limits.
          </p>

          <div className="flex flex-wrap gap-2 justify-center mt-5">
            {([
              { label: 'Multi-character', color: 'var(--color-accent)' },
              { label: 'Real-time debate', color: 'var(--color-accent-cyan)' },
              { label: 'Export transcript', color: '#c084fc' },
              { label: 'Free forever', color: 'var(--color-success)' },
            ] as const).map((feat, i) => (
              <motion.span
                key={feat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-glass border border-border-subtle text-xs text-text-secondary font-mono"
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: feat.color }} />
                {feat.label}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => goTo('setup')}
          className="btn btn-primary w-full"
        >
          Enter the Arena
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </motion.button>
      </div>
    </motion.section>
  )
}
