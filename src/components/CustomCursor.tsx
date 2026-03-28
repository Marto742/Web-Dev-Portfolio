'use client'

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion'

const isTouchDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

const TRAIL_COUNT = 5
const BURST_COUNT = 10
const BURST_RADIUS = 35

interface TrailPoint {
  x: number
  y: number
  velocity: number
}

interface BurstParticle {
  x: number
  y: number
  dx: number
  dy: number
  startTime: number
  duration: number
}

function CursorCanvas({
  mouseX,
  mouseY,
  isVisible,
}: {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
  isVisible: boolean
}) {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<TrailPoint[]>([])
  const burstRef = useRef<BurstParticle[]>([])
  const rafRef = useRef<number>(0)
  const isVisibleRef = useRef(isVisible)

  useEffect(() => {
    isVisibleRef.current = isVisible
  }, [isVisible])

  useEffect(() => {
    if (reducedMotion) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const unsubX = mouseX.on('change', () => {
      const x = mouseX.get()
      const y = mouseY.get()
      const prev = trailRef.current[0]
      const velocity = prev
        ? Math.sqrt(Math.pow(x - prev.x, 2) + Math.pow(y - prev.y, 2))
        : 0
      trailRef.current = [{ x, y, velocity }, ...trailRef.current].slice(0, TRAIL_COUNT)
    })

    const handleDown = (e: MouseEvent) => {
      const now = performance.now()
      const newBursts: BurstParticle[] = Array.from({ length: BURST_COUNT }, (_, i) => {
        const angle = (i / BURST_COUNT) * Math.PI * 2
        return {
          x: e.clientX,
          y: e.clientY,
          dx: Math.cos(angle) * BURST_RADIUS,
          dy: Math.sin(angle) * BURST_RADIUS,
          startTime: now,
          duration: 450,
        }
      })
      burstRef.current = [...burstRef.current, ...newBursts]
    }
    window.addEventListener('mousedown', handleDown)

    const tick = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Trail dots
      trailRef.current.forEach((pt, i) => {
        const freshness = (TRAIL_COUNT - i) / TRAIL_COUNT
        const velocityScale = Math.min(pt.velocity / 40, 1)
        const radius = (2 + freshness * (4 + velocityScale * 8)) / 2
        ctx.globalAlpha = isVisibleRef.current ? freshness * 0.55 : 0
        ctx.fillStyle = '#F5A623'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Burst particles — advance and prune
      burstRef.current = burstRef.current.filter(p => {
        const elapsed = (now - p.startTime) / p.duration
        if (elapsed >= 1) return false
        const tPos = 1 - (1 - elapsed) * (1 - elapsed) // quadratic ease-out
        ctx.globalAlpha = 0.8 * (1 - elapsed)
        ctx.fillStyle = '#F5A623'
        ctx.beginPath()
        ctx.arc(p.x + p.dx * tPos, p.y + p.dy * tPos, 2 * (1 - elapsed), 0, Math.PI * 2)
        ctx.fill()
        return true
      })

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousedown', handleDown)
      unsubX()
    }
  }, [mouseX, mouseY, reducedMotion])

  if (reducedMotion) return null

  return <canvas ref={canvasRef} className="fixed top-0 left-0 pointer-events-none z-[9997]" />
}

function CursorInner() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const springConfig = { stiffness: 600, damping: 45, mass: 0.5 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const trailConfig = { stiffness: 120, damping: 28, mass: 0.8 }
  const trailX = useSpring(mouseX, trailConfig)
  const trailY = useSpring(mouseY, trailConfig)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const interactive = target.closest(
        'a, button, [data-hover], input, textarea, label, [role="button"]'
      )
      setIsHovering(!!interactive)
    }

    const handleLeave = () => setIsVisible(false)
    const handleEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseleave', handleLeave)
    document.addEventListener('mouseenter', handleEnter)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseleave', handleLeave)
      document.removeEventListener('mouseenter', handleEnter)
    }
  }, [isVisible, mouseX, mouseY])

  return (
    <>
      {/* Canvas — trail dots + click burst, zero DOM nodes per particle */}
      <CursorCanvas mouseX={mouseX} mouseY={mouseY} isVisible={isVisible} />

      {/* Trail ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-amber/70"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 44 : 28,
          height: isHovering ? 44 : 28,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />

      {/* Core dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-amber"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 8 : 5,
          height: isHovering ? 8 : 5,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      />
    </>
  )
}

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted || isTouchDevice()) return null
  return <CursorInner />
}
