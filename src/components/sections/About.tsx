'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import ContributionGraph from '@/components/ContributionGraph'

interface GitHubStats {
  repos: number
  followers: number
  contributions: number
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const [ghStats, setGhStats] = useState<GitHubStats | null>(null)

  useEffect(() => {
    fetch('/api/github')
      .then(r => r.ok ? r.json() : null)
      .then((d: { repos: number; followers: number; calendar: { totalContributions: number } } | null) => {
        if (d) setGhStats({ repos: d.repos, followers: d.followers, contributions: d.calendar.totalContributions })
      })
      .catch(() => null)
  }, [])
  const labelRef = useScrollReveal<HTMLParagraphElement>({ y: 30, delay: 0 })
  const textRef = useScrollReveal<HTMLDivElement>({ y: 60, duration: 1.1 })
  const imageRef = useScrollReveal<HTMLDivElement>({ x: 60, y: 0, duration: 1.1, delay: 0.15 })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen flex items-center py-32 overflow-hidden bg-bg-alt"
    >
      {/* Ambient accent */}
      <motion.div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px] bg-amber pointer-events-none"
        style={{ y: bgY }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left — text */}
        <div>
          <p ref={labelRef} className="section-label mb-8">
            01 &mdash; About
          </p>

          <div ref={textRef}>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-[1.1] tracking-tight mb-8">
              Crafting digital<br />
              <span className="italic text-ink/70">experiences</span>{' '}
              that matter.
            </h2>

            <div className="space-y-5 font-sans text-ink-muted leading-relaxed text-[1.05rem] max-w-xl">
              <p>
                I&apos;m Martin, a junior developer with a deep obsession for{' '}
                <span className="amber-highlight font-medium">beautiful, purposeful UI</span> and
                clean, scalable architecture. I build things that feel as good as they work.
              </p>
              <p>
                My work lives at the intersection of design and engineering — from{' '}
                <span className="amber-highlight font-medium">Three.js particle systems</span> to{' '}
                production{' '}
                <span className="amber-highlight font-medium">full-stack applications</span> with
                real users. Every project is a chance to push what&apos;s possible.
              </p>
              <p>
                Currently seeking my next role at a team that gives a damn about craft. If
                you&apos;re building something extraordinary, I want in.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              {[
                {
                  value: ghStats ? `${ghStats.repos}` : '—',
                  label: 'Public repos',
                },
                {
                  value: ghStats ? `${ghStats.contributions}` : '—',
                  label: 'Contributions',
                },
                {
                  value: ghStats ? `${ghStats.followers}` : '—',
                  label: 'Followers',
                },
              ].map(stat => (
                <div key={stat.label} className="border-t border-white/[0.08] pt-5">
                  <p className="font-display text-3xl font-bold text-amber leading-none mb-1">
                    {stat.value}
                  </p>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-ink-muted/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — portrait */}
        <div ref={imageRef} className="flex justify-center lg:justify-end">
          <div className="relative">
            {/* Frame */}
            <div className="relative w-72 h-96 md:w-80 md:h-[440px]">
              {/* Offset amber border */}
              <div
                className="absolute -bottom-4 -right-4 w-full h-full border border-amber/30"
                aria-hidden="true"
              />

              {/* Photo placeholder */}
              <div className="absolute inset-0 bg-bg-card border border-white/[0.08] overflow-hidden">
                {/* Cinematic placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#111] to-[#0d0d0d]" />

                {/* Abstract face silhouette */}
                <svg
                  viewBox="0 0 320 440"
                  className="absolute inset-0 w-full h-full opacity-20"
                  aria-hidden="true"
                >
                  <defs>
                    <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%">
                      <stop offset="0%" stopColor="#F5A623" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse cx="160" cy="170" rx="90" ry="110" fill="url(#faceGrad)" />
                  <ellipse cx="160" cy="380" rx="130" ry="80" fill="url(#faceGrad)" />
                </svg>

                {/* Monogram */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-display text-8xl font-black text-amber/15 leading-none select-none">
                      MP
                    </p>
                    <p className="font-mono text-xs tracking-[0.4em] text-ink-muted/30 mt-4 uppercase">
                      Portrait
                    </p>
                  </div>
                </div>

                {/* Horizontal scan lines */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Floating label */}
            <motion.div
              className="absolute -left-6 top-8 glass-card px-4 py-2.5"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-amber">
                Available Now
              </p>
              <span className="absolute top-3 -left-1 w-2 h-2 rounded-full bg-amber animate-pulse" />
            </motion.div>
          </div>
        </div>
      </div>

        {/* Contribution graph — full width below two-column layout */}
        <div className="mt-20 border-t border-white/[0.05] pt-14">
          <ContributionGraph />
        </div>
      </div>
    </section>
  )
}
