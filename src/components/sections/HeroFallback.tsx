'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import MagneticButton from '@/components/ui/MagneticButton'
import { useTypewriter } from '@/hooks/useTypewriter'

// ---------- CSS particle data (generated once at module level) ----------

interface Dot {
  left: number
  top: number
  size: number
  color: string
  delay: number
  duration: number
}

// Deterministic pseudo-random via integer hash — stable across re-renders
function hash(n: number): number {
  let x = ((n >>> 16) ^ n) * 0x45d9f3b
  x = ((x >>> 16) ^ x) * 0x45d9f3b
  x = (x >>> 16) ^ x
  return (x >>> 0) / 4294967296
}

const DOTS: Dot[] = Array.from({ length: 70 }, (_, i) => {
  const r1 = hash(i * 4 + 0)
  const r2 = hash(i * 4 + 1)
  const r3 = hash(i * 4 + 2)
  const r4 = hash(i * 4 + 3)
  const color = r1 < 0.12 ? '#F5A623' : r1 < 0.30 ? '#3a3a3a' : '#ffffff'
  return {
    left: r2 * 100,
    top: r3 * 100,
    size: 1.5 + r4 * 2.5,
    color,
    delay: hash(i + 100) * 6,
    duration: 4 + hash(i + 200) * 4,
  }
})

// ---------- Shared text constants (mirror Hero.tsx) ----------

const nameLetters = 'Martin Petrov'.split('')

const letterVariants = {
  hidden: { y: 90, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      delay: 0.3 + i * 0.045,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
}

// ---------- Component ----------

export default function HeroFallback() {
  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 600], [0, -80])
  const indicatorOpacity = useTransform(scrollY, [0, 200], [1, 0])

  const subtitle = useTypewriter('Frontend & Full-Stack Developer', 55, 1800)

  const scrollToWork = () => {
    document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-bg"
    >
      {/* CSS particle layer */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {DOTS.map((dot, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              backgroundColor: dot.color,
              opacity: dot.color === '#3a3a3a' ? 0.5 : 0.6,
              animationName: 'float',
              animationDuration: `${dot.duration}s`,
              animationDelay: `${dot.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #090909 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content — identical to HeroWebGL */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        style={{ y: parallaxY }}
      >
        {/* Kicker */}
        <motion.p
          className="section-label mb-8 tracking-[0.5em]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Available for freelance &amp; roles
        </motion.p>

        {/* Name — letter-by-letter reveal */}
        <h1
          className="font-display font-black leading-none tracking-tight mb-8 overflow-hidden"
          style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}
          aria-label="Martin Petrov"
        >
          <span className="flex flex-wrap justify-center gap-x-[0.07em]">
            {nameLetters.map((char, i) =>
              char === ' ' ? (
                <span key={`space-${i}`} className="w-[0.25em]" />
              ) : (
                <div key={i} style={{ overflow: 'hidden', display: 'inline-block' }}>
                  <motion.span
                    custom={i}
                    variants={letterVariants}
                    initial="hidden"
                    animate="visible"
                    className="inline-block text-gradient"
                  >
                    {char}
                  </motion.span>
                </div>
              )
            )}
          </span>
        </h1>

        {/* Subtitle — typewriter */}
        <div className="h-8 mb-12 flex items-center justify-center">
          <motion.p
            className={`font-mono text-lg md:text-xl text-ink-muted tracking-wider ${
              subtitle.length < 34 ? 'typewriter-cursor' : ''
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.3 }}
          >
            {subtitle}
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <MagneticButton
            onClick={scrollToWork}
            className="group relative font-mono text-sm tracking-[0.2em] uppercase text-amber border border-amber/50 px-10 py-4 hover:bg-amber/8 hover:border-amber transition-all duration-400 overflow-hidden"
          >
            <span className="relative z-10">View My Work</span>
            <span className="absolute inset-0 bg-amber/5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: indicatorOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 0.8 }}
        aria-hidden="true"
      >
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-ink-muted/50">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-amber/40 to-transparent animate-pulse" />
      </motion.div>
    </section>
  )
}
