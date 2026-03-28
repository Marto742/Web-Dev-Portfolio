'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { isSoundEnabled, setSoundEnabled } from '@/lib/sound'

export default function SoundToggle() {
  const [mounted, setMounted] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    setMounted(true)
    setEnabled(isSoundEnabled())
    const handler = () => setEnabled(isSoundEnabled())
    window.addEventListener('sound-toggle', handler)
    return () => window.removeEventListener('sound-toggle', handler)
  }, [])

  if (!mounted) return <div className="w-8 h-8" />

  const toggle = () => setSoundEnabled(!enabled)

  return (
    <motion.button
      onClick={toggle}
      className="relative w-8 h-8 flex items-center justify-center text-ink-muted hover:text-amber transition-colors duration-300"
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
      data-hover
      whileTap={{ scale: 0.85 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {enabled ? (
          <motion.svg
            key="sound-on"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </motion.svg>
        ) : (
          <motion.svg
            key="sound-off"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[18px] h-[18px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
