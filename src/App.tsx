import { useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DebateProvider, useDebate } from './DebateContext'
import { ToastContainer, useToast } from './components/Toast'
import Background from './components/Background'
import LandingScreen from './components/LandingScreen'
import SetupScreen from './components/SetupScreen'
import ArenaScreen from './components/ArenaScreen'
import ResultsScreen from './components/ResultsScreen'
import type { ScreenName } from './types'

const SCREENS: Record<ScreenName, React.ComponentType> = {
  landing: LandingScreen,
  setup: SetupScreen,
  arena: ArenaScreen,
  results: ResultsScreen,
}

function AppInner() {
  const { screen } = useDebate()
  const { toasts, showToast } = useToast()
  const { emitToast } = useDebate()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      emitToast.current = showToast
    }
  }, [showToast, emitToast])

  const Screen = SCREENS[screen]

  return (
    <>
      <Background />
      <div id="app" className="relative z-1 min-h-dvh flex flex-col">
        <AnimatePresence mode="wait">
          <Screen key={screen} />
        </AnimatePresence>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  )
}

export default function App() {
  return (
    <DebateProvider>
      <AppInner />
    </DebateProvider>
  )
}
