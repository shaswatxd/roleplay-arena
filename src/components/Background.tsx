import { motion } from 'framer-motion'

export default function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute w-[800px] h-[800px] -top-48 -left-48"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] -bottom-36 -right-36"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
        }}
        animate={{
          x: [0, -20, 30, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.95, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 70%)',
        }}
      />
    </div>
  )
}
