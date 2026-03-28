'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-bg flex items-center justify-center overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(245,166,35,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <motion.div
        className="relative z-10 text-center px-6 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Code label */}
        <p className="font-mono text-xs tracking-[0.4em] uppercase text-amber mb-6 opacity-70">
          Error — 404
        </p>

        {/* Big number */}
        <div className="relative mb-8 select-none">
          <span
            className="font-display font-black leading-none text-gradient"
            style={{ fontSize: 'clamp(7rem, 22vw, 16rem)' }}
            aria-hidden="true"
          >
            404
          </span>
          {/* Amber glow under number */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 blur-2xl opacity-30"
            style={{ background: '#F5A623' }}
          />
        </div>

        {/* Heading */}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink mb-4">
          This page doesn&apos;t exist
        </h1>

        {/* Sub */}
        <p className="font-sans text-ink-muted text-sm md:text-base leading-relaxed mb-12 max-w-sm mx-auto">
          Looks like you wandered off the map. The page you&apos;re looking for has
          either moved or never existed.
        </p>

        {/* Divider */}
        <div className="w-16 h-px bg-amber/30 mx-auto mb-12" />

        {/* Back home button */}
        <motion.div
          className="inline-flex"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 font-mono text-sm tracking-[0.2em] uppercase text-amber border border-amber/40 px-8 py-4 hover:bg-amber/8 hover:border-amber transition-all duration-300 group"
          >
            <span
              className="inline-block transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden="true"
            >
              ←
            </span>
            Back to home
          </Link>
        </motion.div>

        {/* Decorative dots */}
        <div className="flex items-center justify-center gap-2 mt-16 opacity-20">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-amber"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
