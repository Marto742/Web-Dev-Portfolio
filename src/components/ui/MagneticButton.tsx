'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  href?: string
  strength?: number
}

export default function MagneticButton({
  children,
  className,
  onClick,
  href,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 })
  const springY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * strength)
    y.set((e.clientY - cy) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const sharedProps = {
    style: { x: springX, y: springY },
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className: cn('inline-block', className),
    'data-hover': true,
  }

  if (href) {
    return (
      <motion.a href={href} ref={ref as React.RefObject<HTMLAnchorElement>} {...sharedProps}>
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button onClick={onClick} ref={ref as React.RefObject<HTMLButtonElement>} {...sharedProps}>
      {children}
    </motion.button>
  )
}
