import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: number
  msg: string
  type: string
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((msg: string, type = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return { toasts, showToast }
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`px-5 py-2.5 rounded-full font-mono text-sm backdrop-blur-xl text-text-primary border border-border-strong bg-bg-secondary shadow-lg whitespace-nowrap pointer-events-auto ${
              t.type === 'success' ? 'border-l-success/30' :
              t.type === 'error' ? 'border-l-error/30' : ''
            }`}
          >
            {t.type === 'success' && <span className="text-success">✓ </span>}
            {t.type === 'error' && <span className="text-error">✕ </span>}
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
