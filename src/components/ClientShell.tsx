'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { startAmbientMode } from '@/lib/sound'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import CustomCursor from '@/components/CustomCursor'
import FilmGrain from '@/components/FilmGrain'
import Navbar from '@/components/Navbar'
import ScrollProgress from '@/components/ScrollProgress'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'
import Skills from '@/components/sections/Skills'
import Contact from '@/components/sections/Contact'

function Footer() {
  return (
    <footer className="relative bg-bg border-t border-white/[0.04] py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-ink-muted/30">
          © 2025 Martin Petrov
        </p>
        <p className="font-mono text-[10px] tracking-wider text-ink-muted/20">
          Designed &amp; built with intention.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber/40 hover:text-amber transition-colors duration-300"
          data-hover
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}

export default function ClientShell() {
  useEffect(() => startAmbientMode(), [])

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <ScrollProgress />
      <CustomCursor />
      <FilmGrain />
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
        <Footer />
      </motion.main>
    </>
  )
}
