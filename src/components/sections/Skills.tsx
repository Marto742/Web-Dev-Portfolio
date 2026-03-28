'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { frontendSkills, fullStackSkills } from '@/data/portfolio'

interface OrbitalSkillProps {
  label: string
  angle: number
  radius: number
  speed: number
  direction: 1 | -1
  color: string
}

function OrbitalSkill({ label, angle: initialAngle, radius, speed, direction }: OrbitalSkillProps) {
  const [angle, setAngle] = useState(initialAngle)
  const [hovered, setHovered] = useState(false)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const angleRef = useRef(initialAngle)

  useEffect(() => {
    const loop = (ts: number) => {
      if (lastTimeRef.current) {
        const dt = ts - lastTimeRef.current
        if (!hovered) {
          angleRef.current += (speed * direction * dt) / 1000
          setAngle(angleRef.current)
        }
      }
      lastTimeRef.current = ts
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hovered, speed, direction])

  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{ transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))` }}
    >
      <motion.button
        className={`font-mono text-[10px] md:text-xs tracking-wider uppercase px-3 py-1.5 border rounded-sm transition-all duration-300 whitespace-nowrap ${
          hovered
            ? 'text-amber border-amber bg-amber/10 shadow-[0_0_16px_rgba(245,166,35,0.3)]'
            : 'text-ink-muted/60 border-white/[0.1] bg-transparent hover:text-amber/80 hover:border-amber/30'
        }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-hover
      >
        {label}
      </motion.button>
    </motion.div>
  )
}

export default function Skills() {
  const labelRef = useScrollReveal<HTMLParagraphElement>({ y: 30 })
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 50, duration: 1.1 })
  const orbitsRef = useScrollReveal<HTMLDivElement>({ y: 40, duration: 1.2, delay: 0.2 })

  const innerRadius = 120
  const outerRadius = 210

  return (
    <section id="skills" className="relative py-32 overflow-hidden bg-bg-alt">
      {/* Ambient */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.03] blur-[100px] bg-amber pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-20">
          <p ref={labelRef} className="section-label mb-4">
            03 &mdash; Expertise
          </p>
          <h2
            ref={headingRef}
            className="font-display text-4xl md:text-6xl font-bold text-ink leading-tight tracking-tight"
          >
            The tools I<br />
            <span className="italic text-ink/60">wield.</span>
          </h2>
        </div>

        {/* Orbital visualization */}
        <div ref={orbitsRef} className="flex items-center justify-center">
          <div
            className="relative"
            style={{ width: (outerRadius + 80) * 2, height: (outerRadius + 80) * 2, maxWidth: '100%' }}
          >
            {/* Outer ring line */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
              style={{ width: outerRadius * 2, height: outerRadius * 2 }}
              aria-hidden="true"
            />

            {/* Inner ring line */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
              style={{ width: innerRadius * 2, height: innerRadius * 2 }}
              aria-hidden="true"
            />

            {/* Center badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 rounded-full border border-amber/20 flex items-center justify-center bg-bg">
                <div className="w-12 h-12 rounded-full border border-amber/30 flex items-center justify-center bg-amber/5">
                  <span className="font-display text-amber text-lg font-bold">MP</span>
                </div>
              </div>
              {/* Pulse ring */}
              <div
                className="absolute inset-0 rounded-full border border-amber/15 animate-ping"
                style={{ animationDuration: '3s' }}
                aria-hidden="true"
              />
            </div>

            {/* Frontend skills — inner orbit */}
            {frontendSkills.map((skill, i) => (
              <OrbitalSkill
                key={skill}
                label={skill}
                angle={(i / frontendSkills.length) * Math.PI * 2}
                radius={innerRadius}
                speed={0.35}
                direction={1}
                color="#F5A623"
              />
            ))}

            {/* Full-stack skills — outer orbit */}
            {fullStackSkills.map((skill, i) => (
              <OrbitalSkill
                key={skill}
                label={skill}
                angle={(i / fullStackSkills.length) * Math.PI * 2 + Math.PI / fullStackSkills.length}
                radius={outerRadius}
                speed={0.22}
                direction={-1}
                color="#FFD060"
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-10 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-white/20" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-muted/40">
              Frontend
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-px bg-amber/30" />
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-muted/40">
              Full-Stack
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
