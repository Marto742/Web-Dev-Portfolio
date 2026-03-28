'use client'

import { useState, useRef, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import MagneticButton from '@/components/ui/MagneticButton'
import { sendContact } from '@/actions'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const submitRef = useRef<HTMLDivElement>(null)

  const labelRef = useScrollReveal<HTMLParagraphElement>({ y: 30 })
  const headingRef = useScrollReveal<HTMLHeadingElement>({ y: 50, duration: 1.1 })
  const formRef = useScrollReveal<HTMLFormElement>({ y: 40, delay: 0.1, duration: 1 })

  const spawnParticles = () => {
    if (!submitRef.current) return
    const rect = submitRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    const newParticles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 250,
      vy: (Math.random() - 0.5) * 250 - 60,
      size: Math.random() * 5 + 2,
    }))

    setParticles(newParticles)
    setTimeout(() => setParticles([]), 1200)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return

    setLoading(true)
    setError(null)

    try {
      const result = await sendContact({ name, email, message })

      if (result.error) {
        setError(result.error)
        return
      }

      spawnParticles()
      setTimeout(() => {
        setSubmitted(true)
        setName('')
        setEmail('')
        setMessage('')
      }, 200)
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase =
    'w-full bg-transparent border-b px-0 py-3 font-sans text-ink text-base outline-none transition-all duration-300 placeholder:text-ink-muted/30'

  return (
    <section id="contact" className="relative py-32 overflow-hidden bg-bg-alt">
      {/* Ambient */}
      <div
        className="absolute bottom-0 right-0 w-[700px] h-[500px] opacity-[0.03] blur-[120px] bg-amber pointer-events-none"
        aria-hidden="true"
      />

      {/* Particle burst layer */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="fixed rounded-full bg-amber pointer-events-none z-[9990]"
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
            animate={{
              x: p.x + p.vx,
              y: p.y + p.vy,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ width: p.size, height: p.size, translateX: '-50%', translateY: '-50%' }}
          />
        ))}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left */}
          <div>
            <p ref={labelRef} className="section-label mb-4">
              05 &mdash; Let&apos;s Talk
            </p>
            <h2
              ref={headingRef}
              className="font-display text-4xl md:text-6xl font-bold text-ink leading-tight tracking-tight mb-8"
            >
              Start a<br />
              <span className="italic text-ink/60">conversation.</span>
            </h2>

            <p className="font-sans text-ink-muted leading-relaxed max-w-md mb-12">
              Have a project in mind? Looking for a developer who genuinely cares about craft?
              Reach out — I respond to every message.
            </p>

            {/* Social links */}
            <div className="flex gap-4">
              {[
                { icon: <GithubIcon />, label: 'GitHub', href: 'https://github.com' },
                { icon: <LinkedinIcon />, label: 'LinkedIn', href: 'https://linkedin.com' },
              ].map(social => (
                <MagneticButton
                  key={social.label}
                  href={social.href}
                  className="flex items-center gap-2.5 font-mono text-xs tracking-widest uppercase text-ink-muted border border-white/[0.1] px-5 py-3 hover:text-amber hover:border-amber/40 transition-all duration-300 group"
                >
                  <span className="text-amber/60 group-hover:text-amber transition-colors">
                    {social.icon}
                  </span>
                  {social.label}
                </MagneticButton>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="py-16 text-center"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-14 h-14 rounded-full border border-amber/40 flex items-center justify-center mx-auto mb-6 text-amber text-2xl">
                    ✓
                  </div>
                  <h3 className="font-display text-2xl font-bold text-ink mb-3">Message sent.</h3>
                  <p className="font-sans text-ink-muted text-sm">
                    Thanks for reaching out. I&apos;ll get back to you soon.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-8 font-mono text-xs tracking-widest uppercase text-amber/60 hover:text-amber transition-colors"
                    data-hover
                  >
                    Send another
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-10"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Name */}
                  <div className="relative">
                    <label
                      htmlFor="contact-name"
                      className={`absolute top-3 left-0 font-mono text-[9px] tracking-[0.35em] uppercase transition-all duration-300 pointer-events-none ${
                        focusedField === 'name' || name
                          ? '-top-4 text-amber text-[8px]'
                          : 'text-ink-muted/40'
                      }`}
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className={`${inputBase} ${
                        focusedField === 'name'
                          ? 'border-amber'
                          : 'border-white/[0.12] hover:border-white/20'
                      }`}
                      required
                      data-hover
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-px bg-amber transition-all duration-500 ${
                        focusedField === 'name' ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <label
                      htmlFor="contact-email"
                      className={`absolute top-3 left-0 font-mono text-[9px] tracking-[0.35em] uppercase transition-all duration-300 pointer-events-none ${
                        focusedField === 'email' || email
                          ? '-top-4 text-amber text-[8px]'
                          : 'text-ink-muted/40'
                      }`}
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className={`${inputBase} ${
                        focusedField === 'email'
                          ? 'border-amber'
                          : 'border-white/[0.12] hover:border-white/20'
                      }`}
                      required
                      data-hover
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-px bg-amber transition-all duration-500 ${
                        focusedField === 'email' ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <label
                      htmlFor="contact-message"
                      className={`absolute top-3 left-0 font-mono text-[9px] tracking-[0.35em] uppercase transition-all duration-300 pointer-events-none ${
                        focusedField === 'message' || message
                          ? '-top-4 text-amber text-[8px]'
                          : 'text-ink-muted/40'
                      }`}
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      autoComplete="off"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                      rows={4}
                      className={`${inputBase} resize-none ${
                        focusedField === 'message'
                          ? 'border-amber'
                          : 'border-white/[0.12] hover:border-white/20'
                      }`}
                      required
                      data-hover
                    />
                    <div
                      className={`absolute bottom-0 left-0 h-px bg-amber transition-all duration-500 ${
                        focusedField === 'message' ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>

                  {/* Submit */}
                  <div ref={submitRef} className="space-y-3">
                    <MagneticButton
                      className="group relative w-full font-mono text-sm tracking-[0.2em] uppercase text-bg bg-amber px-8 py-4 hover:bg-amber-light transition-all duration-300 overflow-hidden font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        const form = submitRef.current?.closest('form') as HTMLFormElement | null
                        form?.requestSubmit()
                      }}
                    >
                      <span className="relative z-10">
                        {loading ? 'Sending…' : 'Send Message'}
                      </span>
                      <motion.span
                        className="absolute inset-0 bg-amber-light"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '0%' }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </MagneticButton>

                    {error && (
                      <motion.p
                        className="font-mono text-[10px] tracking-wider text-red-400/80 text-center"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
