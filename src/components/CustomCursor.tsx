'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const isTouchDevice = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

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
