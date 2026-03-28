import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger)

interface ScrollRevealOptions {
  y?: number
  x?: number
  duration?: number
  delay?: number
  ease?: string
  start?: string
  stagger?: number
}

export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0, x: 0 })
      return
    }

    const {
      y = 50,
      x = 0,
      duration = 1,
      delay = 0,
      ease = 'power3.out',
      start = 'top 82%',
    } = options

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y, x },
      {
        opacity: 1,
        y: 0,
        x: 0,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: 'play none none none',
        },
      }
    )

    return () => {
      tween.kill()
      ScrollTrigger.getAll()
        .filter(t => t.trigger === el)
        .forEach(t => t.kill())
    }
  }, [options.y, options.x, options.duration, options.delay, options.ease, options.start])

  return ref
}

export function useStaggerReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    if (prefersReducedMotion()) {
      gsap.set(Array.from(container.children), { opacity: 1, y: 0 })
      return
    }

    const children = Array.from(container.children)
    const { y = 40, duration = 0.8, stagger = 0.12, ease = 'power3.out', start = 'top 80%' } = options

    const tween = gsap.fromTo(
      children,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease,
        scrollTrigger: {
          trigger: container,
          start,
          toggleActions: 'play none none none',
        },
      }
    )

    return () => {
      tween.kill()
      ScrollTrigger.getAll()
        .filter(t => t.trigger === container)
        .forEach(t => t.kill())
    }
  }, [options.y, options.duration, options.stagger, options.ease, options.start])

  return ref
}
