'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { navLinks } from '@/data/portfolio'
import ThemeToggle from '@/components/ThemeToggle'
import SoundToggle from '@/components/SoundToggle'
import { playHover } from '@/lib/sound'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNav = (href: string) => {
    setMenuOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled ? 'py-4' : 'py-7'
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {scrolled && (
        <div className="absolute inset-0 bg-bg/80 backdrop-blur-xl border-b border-white/[0.04]" />
      )}

      <nav className="relative max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display text-xl font-bold text-ink tracking-tight group"
          data-hover
        >
          <span className="text-amber group-hover:text-amber-light transition-colors duration-300">M</span>
          <span className="group-hover:text-ink/80 transition-colors duration-300">P</span>
          <span className="font-mono text-xs text-ink-muted ml-1 tracking-widest">_</span>
        </button>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-10">
          {navLinks.map((link, i) => (
            <li key={link.href}>
              <motion.button
                onClick={() => handleNav(link.href)}
                onMouseEnter={playHover}
                className="font-mono text-xs tracking-widest uppercase text-ink-muted hover:text-amber transition-colors duration-300 group relative"
                data-hover
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.9 + i * 0.08 }}
              >
                <span className="text-amber/50 mr-1">0{i + 1}.</span>
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber group-hover:w-full transition-all duration-300" />
              </motion.button>
            </li>
          ))}
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.3 }}
          >
            <a
              href="/resume.pdf"
              onMouseEnter={playHover}
              className="font-mono text-xs tracking-widest uppercase text-amber border border-amber/40 px-4 py-2 hover:bg-amber/10 hover:border-amber transition-all duration-300"
              data-hover
            >
              Resume
            </a>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.4 }}
          >
            <SoundToggle />
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2.45 }}
          >
            <ThemeToggle />
          </motion.li>
        </ul>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-4">
          <SoundToggle />
          <ThemeToggle />
          <button
            className="flex flex-col gap-[5px] w-6"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            data-hover
          >
          <motion.span
            className="h-px bg-ink block origin-center"
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="h-px bg-ink block"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="h-px bg-ink block origin-center"
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3 }}
          />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-bg-alt/95 backdrop-blur-xl border-b border-white/[0.05] py-8 px-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <li key={link.href}>
                  <motion.button
                    onClick={() => handleNav(link.href)}
                    onMouseEnter={playHover}
                    className="font-display text-2xl text-ink hover:text-amber transition-colors w-full text-left"
                    data-hover
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    {link.label}
                  </motion.button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
