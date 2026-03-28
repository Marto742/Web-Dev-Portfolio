'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollReveal, useStaggerReveal } from '@/hooks/useScrollReveal'
import { projects } from '@/data/portfolio'
import type { Project } from '@/types'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.article
      className={`relative glass-card overflow-hidden group ${
        project.span === 'tall' ? 'row-span-2' : 'row-span-1'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      data-hover
    >
      {/* Amber glow border on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              boxShadow: 'inset 0 0 0 1px rgba(245,166,35,0.45), 0 0 40px rgba(245,166,35,0.08)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Number */}
      <div className="absolute top-5 right-5 font-mono text-[10px] tracking-widest text-ink-muted/30 select-none">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Card content */}
      <div className="p-7 flex flex-col h-full min-h-[200px]">
        {/* Category pill */}
        <span className="inline-flex self-start font-mono text-[9px] tracking-[0.3em] uppercase px-2.5 py-1 border border-white/[0.1] text-ink-muted/60 mb-5 rounded-sm">
          {project.category}
        </span>

        <h3 className="font-display text-2xl font-bold text-ink leading-tight mb-3 group-hover:text-amber transition-colors duration-300">
          {project.title}
        </h3>

        {/* Description — reveals on hover */}
        <motion.p
          className="text-sm text-ink-muted leading-relaxed mb-6"
          animate={{ opacity: hovered ? 1 : 0.6 }}
          transition={{ duration: 0.3 }}
        >
          {project.description}
        </motion.p>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-1.5 mt-auto mb-5">
          {project.tech.map(t => (
            <span
              key={t}
              className="font-mono text-[9px] tracking-wider uppercase text-amber/60 border border-amber/15 px-2 py-0.5 rounded-sm"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Link */}
        <a
          href={project.link}
          className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-amber/70 group-hover:text-amber transition-colors duration-300 self-start"
          data-hover
        >
          View Project
          <span className="relative overflow-hidden inline-block w-6 h-px">
            <motion.span
              className="absolute inset-0 bg-amber/70 group-hover:bg-amber"
              initial={{ x: '-100%' }}
              animate={{ x: hovered ? '0%' : '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </span>
          <motion.span
            animate={{ x: hovered ? 3 : 0, opacity: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.25 }}
          >
            →
          </motion.span>
        </a>
      </div>

      {/* Decorative corner */}
      <div
        className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(circle at bottom right, rgba(245,166,35,0.06) 0%, transparent 70%)',
        }}
      />
    </motion.article>
  )
}

export default function Projects() {
  const labelRef = useScrollReveal<HTMLParagraphElement>({ y: 30 })
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 50, duration: 1.1 })
  const gridRef = useStaggerReveal<HTMLDivElement>({ y: 50, stagger: 0.1, duration: 0.8 })

  return (
    <section id="projects" className="relative py-32 overflow-hidden bg-bg">
      {/* Ambient */}
      <div
        className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.025] blur-[150px] bg-amber pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-16">
          <div>
            <p ref={labelRef} className="section-label mb-4">
              02 &mdash; Selected Work
            </p>
            <h2
              ref={headingRef}
              className="font-display text-4xl md:text-6xl font-bold text-ink leading-tight tracking-tight"
            >
              Things I&apos;ve<br />
              <span className="italic text-ink/60">built.</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-ink-muted/50 max-w-xs text-right leading-relaxed hidden md:block">
            A selection of frontend and full-stack projects — each one a push against the ordinary.
          </p>
        </div>

        {/* Masonry grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[220px]"
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
