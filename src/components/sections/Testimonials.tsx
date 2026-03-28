import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { testimonials } from '@/data/portfolio'
import type { Testimonial } from '@/types'

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <motion.article
      className="flex-shrink-0 w-[360px] md:w-[420px] glass-card p-8 relative group"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
    >
      {/* Large opening quote */}
      <span
        className="absolute top-4 right-6 font-display text-[7rem] leading-none text-amber/10 select-none pointer-events-none font-bold"
        aria-hidden="true"
      >
        &ldquo;
      </span>

      {/* Text */}
      <p className="font-sans text-ink-muted text-[0.95rem] leading-relaxed mb-8 relative z-10">
        &ldquo;{t.text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 border-t border-white/[0.06] pt-5">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-bg-card border border-white/[0.1] flex items-center justify-center flex-shrink-0">
          <span className="font-display text-sm font-bold text-amber/60">
            {t.name.charAt(0)}
          </span>
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-ink">{t.name}</p>
          <p className="font-mono text-[9px] tracking-widest uppercase text-ink-muted/50">
            {t.role} &mdash; {t.company}
          </p>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[inherit]"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(245,166,35,0.18)' }}
        aria-hidden="true"
      />
    </motion.article>
  )
}

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null)
  const labelRef = useScrollReveal<HTMLParagraphElement>({ y: 30 })
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 50, duration: 1.1 })

  return (
    <section id="testimonials" className="relative py-32 overflow-hidden bg-bg">
      {/* Ambient */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[400px] opacity-[0.03] blur-[120px] bg-amber pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <p ref={labelRef} className="section-label mb-4">
            04 &mdash; Kind Words
          </p>
          <h2
            ref={headingRef}
            className="font-display text-4xl md:text-6xl font-bold text-ink leading-tight tracking-tight"
          >
            What people<br />
            <span className="italic text-ink/60">say.</span>
          </h2>
        </div>

        {/* Horizontal scroll track */}
        <div
          ref={trackRef}
          className="testimonials-track flex gap-5 overflow-x-auto pb-4 -mx-6 px-6"
          style={{ cursor: 'grab' }}
          onMouseDown={e => {
            const el = trackRef.current
            if (!el) return
            e.preventDefault()
            el.style.cursor = 'grabbing'
            const startX = e.pageX - el.offsetLeft
            const scrollLeft = el.scrollLeft
            const onMove = (ev: MouseEvent) => {
              const x = ev.pageX - el.offsetLeft
              el.scrollLeft = scrollLeft - (x - startX)
            }
            const onUp = () => {
              el.style.cursor = 'grab'
              window.removeEventListener('mousemove', onMove)
              window.removeEventListener('mouseup', onUp)
            }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} t={t} index={i} />
          ))}

          {/* End spacer */}
          <div className="flex-shrink-0 w-6" aria-hidden="true" />
        </div>

        {/* Drag hint */}
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-ink-muted/30 mt-5 text-center">
          Drag to explore
        </p>
      </div>
    </section>
  )
}
